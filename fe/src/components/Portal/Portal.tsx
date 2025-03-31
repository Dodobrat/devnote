import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type PortalProps = {
  children: React.ReactNode;
  id?: string;
};

export function Portal({ children, id }: PortalProps) {
  const [el, setEl] = useState<HTMLElement | null>(() =>
    id ? document.getElementById(id) : null,
  );

  useEffect(() => {
    if (!id) return;
    const el = document.getElementById(id);
    setEl(el);
  }, [id]);

  if (!el) {
    return createPortal(children, document.body);
  }

  return createPortal(children, el);
}
