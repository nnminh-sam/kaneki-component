import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "../../../src";

/** Card with the new CardHeader `title` / `description` props. */
export function ShowcaseCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader icon={icon} title={title} titleAs="h3" description={description} />
      <CardContent>{children}</CardContent>
    </Card>
  );
}
