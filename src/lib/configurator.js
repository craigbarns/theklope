import { getProductVariantChoices } from './cart.js'

const matchesOption = (option, selected) => String(option) === String(selected)

export const getSingleChoiceDefaults = (product) => Object.fromEntries(
  getProductVariantChoices(product)
    .filter(({ options }) => options.length === 1)
    .map(({ key, options }) => [key, options[0]]),
)

export const getMissingProductVariantChoices = (product, variant = {}) => (
  getProductVariantChoices(product).filter(
    ({ key, options }) => !options.some((option) => matchesOption(option, variant[key])),
  )
)

export const getMissingConfiguratorVariantChoices = (selections = []) => (
  selections.flatMap(({ section, product, variant }) => (
    getMissingProductVariantChoices(product, variant).map((choice) => ({
      ...choice,
      section,
      product,
    }))
  ))
)
