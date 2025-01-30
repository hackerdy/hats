export function MainContent() {
  return (
    <div className="flex-1 p-4">
      <div className="grid gap-4">
        <section className="rounded-lg border border-yellow-400/20 p-6 hover:border-yellow-400/40 transition-colors">
          <h2 className="text-lg font-semibold mb-2">Welcome</h2>
          <p className="text-yellow-400/80">
            Experience luxury at its finest. Explore our exclusive collection and services.
          </p>
        </section>

        <section className="rounded-lg border border-yellow-400/20 p-6 hover:border-yellow-400/40 transition-colors">
          <h2 className="text-lg font-semibold mb-2">Featured</h2>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="aspect-square rounded-lg bg-yellow-400/5 flex items-center justify-center">
                <span className="text-yellow-400/60">Item {item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

