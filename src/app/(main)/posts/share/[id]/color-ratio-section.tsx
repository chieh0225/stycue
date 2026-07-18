// Extracted from the original design mock, not currently rendered anywhere —
// the backend has no color-ratio data model yet and there's no input UI in
// the composer to collect it (see backend-request-share-post-outfit-fields.md,
// section 06). Kept as a ready-to-use component for whenever that's decided,
// rather than left inline as dead markup in page.tsx.
export type ColorRatio = {
  percent: string;
  name: string;
  hex: string;
  bg: string;
  dark: boolean;
  bordered: boolean;
};

export default function ColorRatioSection({ ratios }: { ratios: ColorRatio[] }) {
  if (ratios.length === 0) return null;

  return (
    <>
      <h2 className="mb-3 text-body-lg font-bold text-text-primary">搭配比例</h2>
      <div className="mb-6 grid grid-cols-3 gap-2.5">
        {ratios.map((color) => (
          <div
            key={color.name}
            className={`flex aspect-square flex-col justify-between rounded-card p-3 ${
              color.bordered ? 'border border-border' : ''
            }`}
            style={{ backgroundColor: color.bg }}
          >
            <span
              className={`text-right text-label-md font-bold ${
                color.dark ? 'text-background' : 'text-text-primary'
              }`}
            >
              {color.percent}
            </span>
            <div>
              <div
                className={`text-label-md font-bold ${
                  color.dark ? 'text-background' : 'text-text-primary'
                }`}
              >
                {color.name}
              </div>
              <div
                className={
                  color.dark ? 'text-[10.5px] text-[#d9d2c0]' : 'text-[10.5px] text-text-muted'
                }
              >
                {color.hex}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
