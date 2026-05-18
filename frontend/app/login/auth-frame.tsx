import Image from "next/image";

export function AuthFrame({ form }: { form: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-11rem)] max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
      <section className="max-w-2xl">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center overflow-hidden rounded-md border border-accent/25 bg-elevated/80">
            <Image src="/branding/bob-logo.png" alt="" width={40} height={40} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">bob</p>
            <p className="text-xs text-faint">calm operational workspace</p>
          </div>
        </div>
        <h2 className="mt-8 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          A protected room for leads, context, and quiet operating rhythm.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
          Authentication keeps the product demo closer to a real SaaS foundation while
          preserving Bob&apos;s simple local setup.
        </p>
      </section>
      {form}
    </div>
  );
}
