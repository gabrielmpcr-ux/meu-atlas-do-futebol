// City-center reference coordinates: GeoNames / lutangar/cities.json, CC BY 4.0.
const flightOrigin = {"name": "São Paulo", "lat": -23.5475, "lng": -46.63611};
const flightCities = [
  {
    "iso": "ARG",
    "name": "Avellaneda",
    "aliases": [
      "Avellaneda"
    ],
    "lat": -34.66018,
    "lng": -58.36744
  },
  {
    "iso": "ARG",
    "name": "Buenos Aires",
    "aliases": [
      "Buenos Aires"
    ],
    "lat": -34.61315,
    "lng": -58.37723
  },
  {
    "iso": "ARG",
    "name": "Córdoba",
    "aliases": [
      "Córdoba"
    ],
    "lat": -31.40648,
    "lng": -64.18853
  },
  {
    "iso": "AUT",
    "name": "Salzburgo",
    "aliases": [
      "Salzburg"
    ],
    "lat": 47.79941,
    "lng": 13.04399
  },
  {
    "iso": "AUT",
    "name": "Wals-Siezenheim",
    "aliases": [
      "Wals"
    ],
    "lat": 47.78333,
    "lng": 12.96667
  },
  {
    "iso": "CHL",
    "name": "Santiago",
    "aliases": [
      "Santiago"
    ],
    "lat": -33.45694,
    "lng": -70.64827
  },
  {
    "iso": "COL",
    "name": "Bogotá",
    "aliases": [
      "Bogotá"
    ],
    "lat": 4.60971,
    "lng": -74.08175
  },
  {
    "iso": "DEU",
    "name": "Munique",
    "aliases": [
      "Munich"
    ],
    "lat": 48.13743,
    "lng": 11.57549
  },
  {
    "iso": "ECU",
    "name": "Guayaquil",
    "aliases": [
      "Guayaquil"
    ],
    "lat": -2.19616,
    "lng": -79.88621
  },
  {
    "iso": "ECU",
    "name": "Quito",
    "aliases": [
      "Quito"
    ],
    "lat": -0.22985,
    "lng": -78.52495
  },
  {
    "iso": "ESP",
    "name": "Madrid",
    "aliases": [
      "Madrid"
    ],
    "lat": 40.4165,
    "lng": -3.70256
  },
  {
    "iso": "ESP",
    "name": "Ourense",
    "aliases": [
      "Ourense"
    ],
    "lat": 42.33669,
    "lng": -7.86407
  },
  {
    "iso": "ESP",
    "name": "Pontevedra",
    "aliases": [
      "Pontevedra"
    ],
    "lat": 42.431,
    "lng": -8.64435
  },
  {
    "iso": "ESP",
    "name": "Segovia",
    "aliases": [
      "Segovia"
    ],
    "lat": 40.94808,
    "lng": -4.11839
  },
  {
    "iso": "ESP",
    "name": "Vigo",
    "aliases": [
      "Vigo"
    ],
    "lat": 42.23282,
    "lng": -8.72264
  },
  {
    "iso": "FRA",
    "name": "Nice",
    "aliases": [
      "Nice"
    ],
    "lat": 43.70313,
    "lng": 7.26608
  },
  {
    "iso": "GBR",
    "name": "Londres",
    "aliases": [
      "London"
    ],
    "lat": 51.50853,
    "lng": -0.12574
  },
  {
    "iso": "HUN",
    "name": "Budapeste",
    "aliases": [
      "Budapest"
    ],
    "lat": 47.49835,
    "lng": 19.04045
  },
  {
    "iso": "ITA",
    "name": "Roma",
    "aliases": [
      "Rome"
    ],
    "lat": 41.89193,
    "lng": 12.51133
  },
  {
    "iso": "JPN",
    "name": "Quioto",
    "aliases": [
      "Kyoto"
    ],
    "lat": 35.02107,
    "lng": 135.75385
  },
  {
    "iso": "JPN",
    "name": "Toyota",
    "aliases": [
      "Toyota"
    ],
    "lat": 35.08333,
    "lng": 137.15
  },
  {
    "iso": "JPN",
    "name": "Tóquio",
    "aliases": [
      "Tokyo"
    ],
    "lat": 35.6895,
    "lng": 139.69171
  },
  {
    "iso": "JPN",
    "name": "Yokohama",
    "aliases": [
      "Yokohama"
    ],
    "lat": 35.43333,
    "lng": 139.65
  },
  {
    "iso": "MCO",
    "name": "Monte-Carlo",
    "aliases": [
      "Monte Carlo",
      "Monte-Carlo"
    ],
    "lat": 43.73976,
    "lng": 7.42732
  },
  {
    "iso": "PAN",
    "name": "Cidade do Panamá",
    "aliases": [
      "Panama City"
    ],
    "lat": 8.9936,
    "lng": -79.51973
  },
  {
    "iso": "PER",
    "name": "Lima",
    "aliases": [
      "Lima"
    ],
    "lat": -12.04318,
    "lng": -77.02824
  },
  {
    "iso": "PRT",
    "name": "Chaves",
    "aliases": [
      "Chaves"
    ],
    "lat": 41.74019,
    "lng": -7.46879
  },
  {
    "iso": "PRT",
    "name": "Porto",
    "aliases": [
      "Porto"
    ],
    "lat": 41.1485,
    "lng": -8.61097
  },
  {
    "iso": "PRY",
    "name": "Assunção",
    "aliases": [
      "Asunción"
    ],
    "lat": -25.28646,
    "lng": -57.647
  },
  {
    "iso": "TUR",
    "name": "Istambul",
    "aliases": [
      "Istanbul"
    ],
    "lat": 41.01384,
    "lng": 28.94966
  },
  {
    "iso": "URY",
    "name": "Maldonado",
    "aliases": [
      "Maldonado"
    ],
    "lat": -34.89791,
    "lng": -54.95021
  },
  {
    "iso": "URY",
    "name": "Montevidéu",
    "aliases": [
      "Montevideo"
    ],
    "lat": -34.90328,
    "lng": -56.18816
  },
  {
    "iso": "URY",
    "name": "Punta del Este",
    "aliases": [
      "Punta del Este"
    ],
    "lat": -34.94747,
    "lng": -54.93382
  },
  {
    "iso": "USA",
    "name": "Atlanta",
    "aliases": [
      "Atlanta"
    ],
    "lat": 33.749,
    "lng": -84.38798
  },
  {
    "iso": "USA",
    "name": "Landover",
    "aliases": [
      "Landover"
    ],
    "lat": 38.934,
    "lng": -76.89664
  },
  {
    "iso": "USA",
    "name": "Miami",
    "aliases": [
      "Miami"
    ],
    "lat": 25.77427,
    "lng": -80.19366
  },
  {
    "iso": "USA",
    "name": "Nova Iorque",
    "aliases": [
      "New York",
      "New York City",
      "Nova York"
    ],
    "lat": 40.71427,
    "lng": -74.00597
  },
  {
    "iso": "USA",
    "name": "Orlando",
    "aliases": [
      "Orlando"
    ],
    "lat": 28.53834,
    "lng": -81.37924
  },
  {
    "iso": "USA",
    "name": "Washington DC",
    "aliases": [
      "Washington",
      "Washington D.C.",
      "Washington, D.C."
    ],
    "lat": 38.89511,
    "lng": -77.03637
  },
  {
    "iso": "FRA",
    "name": "Paris",
    "aliases": [
      "Paris"
    ],
    "lat": 48.85341,
    "lng": 2.3488
  }
];
