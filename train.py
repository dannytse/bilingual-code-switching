import datasets
from transformers import WhisperProcessor, WhisperForConditionalGeneration, Seq2SeqTrainingArguments, Seq2SeqTrainer
import torch
from dataclasses import dataclass
from typing import Any, Dict, List, Union
import evaluate
import chinese_converter
import utils
from functools import partial

metric = evaluate.load("wer")

output_dir = "./whisper-tiny-finetune"
training_args = Seq2SeqTrainingArguments(
  output_dir="./whisper-tiny-finetune",  # your dir name
  per_device_train_batch_size=128,
  learning_rate=1e-5,
  warmup_steps=500,
  max_steps=1000,
  gradient_checkpointing=True,
  evaluation_strategy="steps",
  per_device_eval_batch_size=8,
  predict_with_generate=True,
  generation_max_length=225,
  save_steps=10,
  eval_steps=10,
  # logging_steps=5,
  # report_to=["tensorboard"],
  load_best_model_at_end=True,
  metric_for_best_model="wer",
  greater_is_better=False,
  push_to_hub=False,
)


def main():
  train_set = datasets.load_dataset("CAiRE/ASCEND", split="train")
  val_set = datasets.load_dataset("CAiRE/ASCEND", split="validation")
  test_set = datasets.load_dataset("CAiRE/ASCEND", split="test")

  processor = WhisperProcessor.from_pretrained("openai/whisper-tiny")
  model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-tiny")

  train_set_training = train_set.map(prepare_dataset, processor).with_format("torch")
  test_set_training = val_set.map(prepare_dataset, processor).with_format("torch")

  data_collator = DataCollatorSpeechSeq2SeqWithPadding(processor=processor)

  model.config.forced_decoder_ids = None
  model.config.suppress_tokens = []
  model.config.use_cache = False

  trainer = Seq2SeqTrainer(
    args=training_args,
    model=model,
    train_dataset=train_set_training,
    eval_dataset=test_set_training,
    data_collator=data_collator,
    compute_metrics=partial(compute_metrics, processor=processor),
    tokenizer=processor
  )

  model.save_pretrained(training_args.output_dir)
  processor.save_pretrained(training_args.output_dir)

  trainer.train()


def prepare_dataset(batch, processor):

  input_features = []
  input_length = 0
  labels = []

  audio_sample = batch["audio"]
  waveform = audio_sample["array"]
  sampling_rate = audio_sample["sampling_rate"]

  input_features = processor(
      waveform, sampling_rate=sampling_rate, return_tensors="pt"
  ).input_features[0]

  input_length = len(waveform) / sampling_rate

  labels = processor.tokenizer(
    chinese_converter.to_simplified(batch["transcription"].lower())
    ).input_ids

  return {"input_features": input_features, "input_length" : input_length,
      "labels" : labels}


@dataclass
class DataCollatorSpeechSeq2SeqWithPadding:
  processor: Any

  def __call__(self, features: List[Dict[str, Union[List[int], torch.Tensor]]]) -> Dict[str, torch.Tensor]:
    # split inputs and labels since they have to be of different lengths and need different padding methods
    # first treat the audio inputs by simply returning torch tensors
    input_features = [{"input_features": feature["input_features"]} for feature in features]
    batch = self.processor.feature_extractor.pad(input_features, return_tensors="pt")

    # get the tokenized label sequences
    label_features = [{"input_ids": feature["labels"]} for feature in features]
    # pad the labels to max length
    labels_batch = self.processor.tokenizer.pad(label_features, return_tensors="pt")

    # replace padding with -100 to ignore loss correctly
    labels = labels_batch["input_ids"].masked_fill(labels_batch.attention_mask.ne(1), -100)

    # if bos token is appended in previous tokenization step,
    # cut bos token here as it's append later anyways
    if (labels[:, 0] == self.processor.tokenizer.bos_token_id).all().cpu().item():
        labels = labels[:, 1:]

    batch["labels"] = labels

    return batch


def compute_metrics(pred, processor):
    pred_ids = pred.predictions
    label_ids = pred.label_ids

    label_ids[label_ids == -100] = processor.tokenizer.pad_token_id
    label_str = processor.batch_decode(label_ids, skip_special_tokens=True)
    pred_str = processor.batch_decode(pred_ids, skip_special_tokens=True)
    pred_str = [chinese_converter.to_simplified(string.lower()) for string in pred_str]

    wer = utils.calculate_MER(predictions=pred_str, references=label_str)
    return {"wer":wer}


if __name__ == "__main__":
  main()

