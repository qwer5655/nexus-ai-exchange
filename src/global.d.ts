import React from "react";
declare namespace JSX {
  interface IntrinsicElements {
    marquee: React.DetailedHTMLProps<React.HTMLAttributes<HTMLMarqueeElement>, HTMLMarqueeElement> & { scrollamount?: string };
  }
}