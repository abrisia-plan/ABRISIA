import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://abrisia-plan.ca';
const SITE_NAME = 'Abrisia Plan';

const SEO = ({ 
  title, 
  description, 
  path = '/', 
  type = 'website',
  image,
  noindex = false 
}) => {
  const fullTitle = title 
    ? `${title} | ${SITE_NAME}` 
    : `${SITE_NAME} | Plans architecturaux, mini-maisons et chalets au Québec`;
  const fullUrl = `${SITE_URL}${path}`;
  const defaultDescription = "Service professionnel de plans architecturaux au Québec. Plans de mini-maisons, chalets, maisons unifamiliales, extensions et dessins techniques.";
  const desc = description || defaultDescription;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={fullUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="fr_CA" />
      {image && <meta property="og:image" content={image} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default SEO;
