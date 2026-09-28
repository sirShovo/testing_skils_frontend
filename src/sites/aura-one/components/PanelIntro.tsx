import { Device } from './Device'
import { Eyebrow, PillButton, Reveal } from './ui'

export function PanelIntro({ goTo }: { goTo: (i: number) => void }) {
  return (
    <div className="relative flex min-h-full flex-col justify-center gap-8 px-4 pt-28 pb-32 md:gap-6 md:px-14 md:pt-24 md:pb-28">
      <div className="grid items-end gap-8 md:grid-cols-12">
        <Reveal className="md:col-span-9">
          <Eyebrow>Edición limitada · 500 unidades</Eyebrow>
          <h1 className="mt-6 text-[clamp(4.5rem,min(15.5vw,22vh),17rem)] leading-[0.8] font-semibold tracking-[-0.065em] text-(--a-ink)">
            Aura <span className="text-(--a-mute)">One</span>
          </h1>
        </Reveal>
        <Reveal index={1} className="md:col-span-3 md:pb-4">
          <p className="amono text-[11px] tracking-[0.18em] text-(--a-mute) uppercase">Unidad</p>
          <p className="amono mt-1 text-[clamp(2rem,3.6vw,3.4rem)] leading-none tracking-[-0.04em] text-(--a-ink) tabular-nums">
            0137<span className="text-(--a-mute)">/0500</span>
          </p>
        </Reveal>
      </div>

      <div className="grid items-center gap-12 md:grid-cols-12">
        <Reveal index={2} className="md:col-span-8 md:col-start-3">
          {/* El dispositivo se limita por el alto para que el panel quepa sin scroll. */}
          <div className="mx-auto md:max-w-[min(100%,78vh)]">
            <Device />
          </div>
        </Reveal>
        <Reveal index={3} className="flex flex-col gap-6 md:col-span-2 md:col-start-11 md:-ml-6">
          <p className="max-w-[18rem] text-[15px] leading-relaxed text-(--a-ink-2)">
            Un sintetizador de bolsillo para diseñar sonido con las manos. Toca los pads, gira los encoders, mueve los
            faders: responde aquí mismo.
          </p>
          <div className="flex flex-col items-start gap-3">
            <PillButton onClick={() => goTo(3)}>Reservar</PillButton>
            <PillButton variant="light" onClick={() => goTo(1)}>
              Anatomía
            </PillButton>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
