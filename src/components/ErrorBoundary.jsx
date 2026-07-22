import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Vercel collecte console.error ; aucun détail sensible n'est affiché au client.
    console.error('THEKLOPE render error:', error, info?.componentStack || '')
  }

  componentDidUpdate(previousProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      // Une navigation peut sortir d'une route défaillante sans recharger tout le site.
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ error: null })
    }
  }

  render() {
    if (!this.state.error) return this.props.children

    const pageOnly = this.props.variant === 'page'
    const Container = pageOnly ? 'div' : 'main'
    return (
      <Container id={pageOnly ? undefined : 'contenu'} className="container-page grid min-h-[70vh] place-items-center py-16">
        <section className="card w-full max-w-lg p-8 text-center" role="alert">
          <p className="eyebrow mb-3">Incident temporaire</p>
          <h1 className="font-display text-2xl font-bold text-white">
            Cette page n'a pas pu s'afficher.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Vos données de panier sont conservées. Une actualisation résout généralement ce type d'incident.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
              Actualiser la page
            </button>
            <a href="/" className="btn-ghost">Retour à l'accueil</a>
          </div>
        </section>
      </Container>
    )
  }
}
