export const command = "TZ='America/New_York' date '+%I:%M:%S %p'"
export const refreshFrequency = 1000

export function render({ output }) {
  if (!output) return <div />

  const parts = output.trim().split(' ')
  const [h, m, s] = parts[0].split(':')
  const ampm = parts[1].toLowerCase()

  return (
    <div className="clock">
      <span className="hm">{parseInt(h)}:{m}:</span>
      <span className="sec">{s}</span>
      <span className="ampm">{ampm}</span>
    </div>
  )
}

export const className = `
  bottom: 24px;
  right: 24px;
  font-family: 'SF Mono', Menlo, Monaco, monospace;
  background: rgba(0, 0, 0, 0.52);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 10px;
  padding: 10px 18px;
  border: 1px solid rgba(255, 255, 255, 0.07);

  .clock {
    display: flex;
    align-items: baseline;
    line-height: 1;
  }

  .hm {
    font-size: 22px;
    color: #e8e8e8;
    font-weight: 400;
    letter-spacing: 0.03em;
  }

  .sec {
    font-size: 22px;
    color: #666;
    letter-spacing: 0.03em;
  }

  .ampm {
    font-size: 12px;
    color: #444;
    margin-left: 4px;
  }
`
