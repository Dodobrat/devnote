import { Page } from "~/components/Layout";
import { useDocumentTitle } from "~/hooks";

export function Changelog() {
  useDocumentTitle("DevNote | Changelog");

  return (
    <Page.Card>
      <Page.Content>
        <Page.Title>Changelog</Page.Title>
      </Page.Content>
    </Page.Card>
  );
}
