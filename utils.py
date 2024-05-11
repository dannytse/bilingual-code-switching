import chinese_converter
import re
import evaluate

def insert_space_in_code_switched_text(text):
    text = text.lower()
    # Regular expression to match Chinese characters.
    chinese_char_pattern = r'[\u4e00-\u9fff]'

    # Insert space before and after each Chinese character.
    spaced_text = re.sub(f'({chinese_char_pattern})', r' \1 ', text)

    # Remove any extra spaces added by the previous step.
    normalized_text = re.sub(r'\s+', ' ', spaced_text)
    normalized_text = normalized_text.strip().replace("  ", " ")
    return normalized_text


def calculate_MER(predictions, references):
    metric = evaluate.load("wer")
    predictions = [insert_space_in_code_switched_text(chinese_converter.to_simplified(string)) for string in predictions]
    references = [insert_space_in_code_switched_text(chinese_converter.to_simplified(string)) for string in references]
    return 100 * metric.compute(predictions=predictions, references=references)
