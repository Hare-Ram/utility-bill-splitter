export const tariffs = [
    {
        start: 800,
        perUnitTariff: 9.5
    },
    {
        start: 400,
        end: 800,
        perUnitTariff: 9
    },
    {
        start: 300,
        end: 400,
        perUnitTariff: 8.5
    },
    {
        start: 200,
        end: 300,
        perUnitTariff: 7.2
    },
    {
        start: 0,
        end: 200,
        perUnitTariff: 5
    },
]

export const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export const parseNumber = (value) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

export const formatNumber = (value) => round2(value);

export const calculateTariff = (totalUnits, units) => {
    let temp = totalUnits;
    let remainingUnits = Math.min(units, totalUnits);
    let totalTariff = 0;
    const tariffBreakDown = [];

    tariffs.forEach((slab) => {
        if (temp > 0 && remainingUnits > 0) {
            if (temp > slab.start) {
                let unitsConsumedInSlab;
                if (!slab.end) {
                    unitsConsumedInSlab = Math.min((temp - slab.start), remainingUnits);
                } else {
                    unitsConsumedInSlab = Math.min((slab.end - slab.start), (temp - slab.start), remainingUnits);
                }
                remainingUnits -= unitsConsumedInSlab;
                const tariffForSlab = slab.perUnitTariff * unitsConsumedInSlab;
                totalTariff += tariffForSlab;
                tariffBreakDown.push({
                    Slab: `${slab.start}${slab.end ? '-' + slab.end : '+'}`,
                    Units: unitsConsumedInSlab,
                    Rate: slab.perUnitTariff,
                    Tariff: tariffForSlab
                })
                temp -= unitsConsumedInSlab;
            }
        }
    })
    tariffBreakDown.push({
        Slab: 'Total',
        Units: units,
        Rate: '-',
        Tariff: totalTariff,
    })

    return { totalTariff, tariffBreakDown };
}

export const splitBill = (totalUnits, totalCharges, users, totalPersons) => {
    const totalUnitsValue = parseNumber(totalUnits);
    const totalChargesValue = parseNumber(totalCharges);
    const personsToSplit = Math.max(1, parseInt(totalPersons, 10) || 1);

    const totalApplianceUnits = users.reduce((sum, user) => sum + parseNumber(user.units), 0);

    const { totalTariff, tariffBreakDown } = calculateTariff(totalUnitsValue, totalApplianceUnits);

    let totalApplianceTariff = 0;
    const applianceTariffs = users.map((user) => {
        const units = parseNumber(user.units);
        const tariff = totalApplianceUnits > 0 ? units * (totalTariff / totalApplianceUnits) : 0;
        const rounded = round2(tariff);
        totalApplianceTariff += rounded;
        return { name: user.name, units, applianceCharges: rounded };
    })

    const commonTariff = round2(totalChargesValue - totalApplianceTariff);
    const commonChargesForEachPerson = round2(commonTariff / personsToSplit);

    const peopleCount = Math.max(users.length, personsToSplit);
    const userRows = [];

    for (let i = 0; i < peopleCount; i++) {
        const user = users[i];
        const applianceCharges = user ? applianceTariffs[i].applianceCharges : 0;
        userRows.push({
            Name: user ? user.name : `Person ${i + 1}`,
            Appliance: applianceCharges,
            Common: commonChargesForEachPerson,
            Total: round2(applianceCharges + commonChargesForEachPerson)
        })
    }

    const totalRow = {
        Name: 'Total',
        Appliance: 0,
        Common: 0,
        Total: 0
    }
    userRows.forEach((row) => {
        totalRow.Appliance = round2(totalRow.Appliance + row.Appliance);
        totalRow.Common = round2(totalRow.Common + row.Common);
        totalRow.Total = round2(totalRow.Total + row.Total);
    })
    userRows.push(totalRow);

    return {
        userRows,
        tariffBreakDown,
        summary: {
            totalUnits: totalUnitsValue,
            totalCharges: totalChargesValue,
            persons: personsToSplit,
            totalApplianceUnits,
            applianceTariff: round2(totalApplianceTariff),
            commonTariff,
            commonPerPerson: commonChargesForEachPerson
        }
    };
}
