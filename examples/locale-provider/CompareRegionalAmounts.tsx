import { Field, LocaleProvider, NumberField } from '@cognitap/radiant'

export function CompareRegionalAmounts() {
  return (
    <LocaleProvider locale="ar-EG">
      <div className="grid w-full max-w-md gap-4">
        <Field label="المبلغ">
          <NumberField
            defaultValue={1234.5}
            incrementLabel="زيادة القيمة"
            decrementLabel="تقليل القيمة"
          />
        </Field>
        <LocaleProvider locale="fr-FR">
          <LocaleProvider>
            <Field label="Montant">
              <NumberField
                defaultValue={1234.5}
                incrementLabel="Augmenter"
                decrementLabel="Diminuer"
              />
            </Field>
          </LocaleProvider>
        </LocaleProvider>
      </div>
    </LocaleProvider>
  )
}
