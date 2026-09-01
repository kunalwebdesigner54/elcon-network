const Epin = require('../models/Epin');
const { unusedStockMapForOwners } = require('../controllers/epinsController');

describe('E-Pin franchise live stock', () => {
    test('unusedStockMapForOwners should calculate live unused e-pin counts by current owner', async () => {
        const aggregateSpy = jest.spyOn(Epin, 'aggregate').mockResolvedValue([
            { _id: 'FR001', count: 7 },
            { _id: 'FR002', count: 3 },
        ]);

        const stockMap = await unusedStockMapForOwners(['fr001', 'FR002', 'fr003']);
        expect(stockMap).toEqual({ FR001: 7, FR002: 3 });
        expect(aggregateSpy).toHaveBeenCalled();

        aggregateSpy.mockRestore();
    });
});
