'use client'

export default function Button({ onClick, children, disabled}: {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    children: React.ReactNode;
    disabled: boolean
  }) {
    return (
      <button className="btn btn-primary" onClick={onClick} disabled={disabled}>
        {children}
      </button>
    );
  }