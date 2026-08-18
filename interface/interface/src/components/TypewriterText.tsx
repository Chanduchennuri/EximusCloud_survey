import { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onDone?: () => void;
}

function TypewriterText({ text, speed = 18, onDone }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        onDone?.();
      }
    }, speed);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <span>{displayed}</span>;
}

export default TypewriterText;