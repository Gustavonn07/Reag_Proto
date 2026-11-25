import { ReactNode } from "react";

function Empty({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="center-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}

export {
  Empty
}