'use client'

export default function Button({ onClick, children }: {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    children: React.ReactNode
  }) {
    return (
      <button className="btn btn-primary" onClick={onClick}>
        {children}
      </button>
    );
  }