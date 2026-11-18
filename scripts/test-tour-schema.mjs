import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';

const source = await readFile(new URL('../app/lib/tour-schema.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { buildTourSchema, serializeJsonLd } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const base = { slug: 'tour-prueba', name: 'Tour prueba', h1: 'Tour prueba', short: 'Descripción', image: '/images/bongo-hero.png', category: 'Aventura', price: 75, priceType: 'person', minPeople: 2, schemaPriceVerified: true };
const entity = tour => buildTourSchema(tour)['@graph'][1];
assert.equal(entity(base).offers.price, '75.00');
assert.equal(entity(base).offers.priceCurrency, 'USD');
assert.equal(entity(base).offers.priceSpecification.referenceQuantity.unitText, 'persona');
assert.equal(entity({ ...base, priceType: 'group', groupPrice: 500 }).offers.price, '500.00');
assert.equal(entity({ ...base, priceType: 'group', groupPrice: 500 }).offers.priceSpecification.referenceQuantity.unitText, 'grupo');
for (const override of [{ priceOnRequest: true }, { schemaPriceVerified: false }, { schemaPriceVerified: undefined }, { price: 0 }, { price: -1 }, { price: NaN }]) {
  assert.equal(entity({ ...base, ...override }).offers, undefined);
  assert.equal(entity({ ...base, ...override })['@type'], 'TouristTrip');
}
const seasonal = entity({ ...base, seasonPrices: '[{"start":"2027-01-01","end":"2027-03-01","personPrice":99}]' });
assert.equal(seasonal.offers.price, '75.00'); // visible initial BASE price, not an invented minimum
assert.equal(seasonal.offers.availability, undefined);
assert.equal(seasonal.offers.priceValidUntil, undefined);
assert.equal(seasonal.aggregateRating, undefined);
assert.equal(entity({ ...base, image: 'javascript:alert(1)', gallery: ['/image.webp', 'not a valid relative?'] }).image[0], 'https://bongoutdoors.com/image.webp');
const dangerous = { name: '</script><script>alert(1)</script>\u2028\u2029' };
assert.equal(serializeJsonLd(dangerous).includes('<'), false);
assert.deepEqual(JSON.parse(serializeJsonLd(dangerous)), dangerous);
assert.equal(buildTourSchema(base)['@graph'][2].itemListElement.length, 3);
console.log('Tour schema: all assertions passed.');
