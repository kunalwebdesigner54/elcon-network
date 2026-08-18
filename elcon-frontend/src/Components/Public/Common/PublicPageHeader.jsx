function PublicPageHeader({ title }) {
  return (
    <section className="public-hero">
      <h1>{title}</h1>
      <div className="public-crumb">⌂ {title}</div>
    </section>
  );
}

export default PublicPageHeader;
