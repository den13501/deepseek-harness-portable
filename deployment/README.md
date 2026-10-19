# Portable deployment references

- `PORTABLE.zh-TW.md`: reproducible build, distribution and acceptance guidance.
- `COMPANY-PRIVACY.zh-TW.md`: fixed built-in collection policy and limitations.
- `TRADITIONAL-CHINESE.zh-TW.md`: Traditional Chinese locale behavior.
- `Test-Strata.ps1`: local model compatibility probe; explicitly supply `-ExpectedModel` using the model ID returned by your approved service.

Do not commit machine-specific handovers, credentials, profiles, logs or installation inventories. A CI build does not constitute company-environment acceptance.