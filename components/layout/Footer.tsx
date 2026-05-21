export default function Footer() {
  return (
    <footer className="footer" id="contacto">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <span className="wordmark" style={{ fontSize: 32, color: 'var(--av-cream)' }}>Archivo Vivo</span>
          <p className="desc">
            Un proyecto cinematográfico, sartorial y cultural desde Puerto Rico.
            Donde el artista se vuelve memoria.
          </p>
        </div>

        <div>
          <h6>Capítulos</h6>
          <ul>
            <li><a href="#episodios">El Archivo</a></li>
            <li><a href="#indumentaria">Indumentaria</a></li>
            <li><a href="#maquinas">Las Máquinas</a></li>
            <li><a href="#manifiesto">Manifiesto</a></li>
          </ul>
        </div>

        <div>
          <h6>Contacto</h6>
          <ul>
            <li><a href="mailto:hola@archivovivo.com">hola@archivovivo.com</a></li>
            <li><a href="mailto:prensa@archivovivo.com">prensa@archivovivo.com</a></li>
            <li><a href="mailto:maquinas@archivovivo.com">Proponer locación</a></li>
            <li><span>San Juan · Puerto Rico</span></li>
          </ul>
        </div>

        <div>
          <h6>Otros</h6>
          <ul>
            <li><a href="#">Términos</a></li>
            <li><a href="#">Privacidad</a></li>
            <li><a href="#">Tiendas físicas</a></li>
            <li><a href="#">Prensa · EPK</a></li>
          </ul>
        </div>
      </div>

      <div className="wrap footer-base">
        <div>© MMXXVI · Archivo Vivo · All rights reserved</div>
        <div>Ideas. Visión. Legado.</div>
        <div>v01 · San Juan, PR</div>
      </div>
    </footer>
  )
}
