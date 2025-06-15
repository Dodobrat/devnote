import {
  hyperLinkExtension,
  hyperLinkStyle,
} from "@uiw/codemirror-extensions-hyper-link";
import { type Extension } from "@uiw/react-codemirror";

export function createCustomHyperLinkExtension(): Extension {
  return [
    hyperLinkExtension({
      regexp:
        /(?:https?:\/\/[^\s]+|\/(?:note\/(?:new|welcome|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})|app\/(?:help|changelog|settings)))/gi,
      handle: (value) => {
        const cleanedValue = value.trim().replace(/[.,;!?)'"\]]$/, "");
        return cleanedValue;
      },
    }),
    hyperLinkStyle,
  ];
}
