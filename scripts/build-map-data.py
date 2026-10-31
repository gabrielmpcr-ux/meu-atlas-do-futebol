"""Build the small, local country layer (requires shapely for regeneration only)."""
import argparse
import json
from pathlib import Path
from shapely.geometry import shape, mapping

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path, help='Downloaded datasets/geo-countries countries.geojson')
parser.add_argument('output', type=Path, nargs='?', default=Path('data/countries.geojson'))
args = parser.parse_args()

def rounded(value):
    if isinstance(value, (list, tuple)):
        return [rounded(item) for item in value]
    return round(value, 5) if isinstance(value, (float, int)) else value

features = []
for feature in json.loads(args.source.read_text())['features']:
    geometry = dict(mapping(shape(feature['geometry']).simplify(.035, preserve_topology=True)))
    geometry['coordinates'] = rounded(geometry['coordinates'])
    properties = feature['properties']
    features.append({'type': 'Feature', 'properties': {
        key: properties[key] for key in ('name', 'ISO3166-1-Alpha-3') if key in properties
    }, 'geometry': geometry})
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps({'type': 'FeatureCollection', 'features': features},
                                ensure_ascii=False, separators=(',', ':')))
print(f'{len(features)} features; {args.output.stat().st_size} bytes')
