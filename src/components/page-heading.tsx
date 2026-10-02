export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}
