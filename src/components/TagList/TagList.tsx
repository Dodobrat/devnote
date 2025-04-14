import { TagIcon } from "lucide-react";

import { cn } from "~/lib/utils";

import { Badge } from "../ui";

type TagListProps = {
  tags: string[];
  className?: string;
};

export function TagList({ tags, className }: TagListProps) {
  return (
    <p className={cn("flex flex-wrap items-start gap-1", className)}>
      {tags.map((tag) => (
        <Badge key={tag} variant="outline">
          <TagIcon />
          {tag}
        </Badge>
      ))}
    </p>
  );
}
