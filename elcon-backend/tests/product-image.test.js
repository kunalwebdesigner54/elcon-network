const { getProducts } = require('../controllers/productsController');

describe('Product image handling', () => {
    test('getProducts should keep long data URLs for uploaded product images', async () => {
        const Product = require('../models/Product');
        const aggregateSpy = jest.spyOn(Product, 'aggregate').mockResolvedValue([
            {
                _id: 'p1',
                type: 'joining',
                productCode: 'JP101',
                productName: 'Live Health',
                category: 'Healthcare',
                hsnCode: '4440',
                mrp: 375,
                dpPrice: 350,
                discount: 0,
                gst: 0,
                shipping: 0,
                bvPoint: 200,
                levelPoint: 200,
                quantity: 50,
                reserveAmount: 0,
                status: 'SHOWING',
                imageKey: 'data:image/png;base64,' + 'x'.repeat(2000),
                images: ['data:image/png;base64,' + 'y'.repeat(1500)],
                description: 'desc',
                specifications: '',
                features: '',
                size: '',
                color: '',
                weight: '',
                dimension: '',
            },
        ]);

        const req = { query: { type: 'joining' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getProducts(req, res, false);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                count: 1,
                products: expect.arrayContaining([
                    expect.objectContaining({
                        imageKey: expect.stringMatching(/^data:image\/png;base64,/),
                        images: expect.arrayContaining([expect.stringMatching(/^data:image\/png;base64,/)]),
                        productName: 'Live Health',
                    }),
                ]),
            })
        );

        aggregateSpy.mockRestore();
    });
});
