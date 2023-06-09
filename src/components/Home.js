import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Typography } from '@mui/material';
import Table from './table/Table';

const tariffs = [
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

const calculateTariff = (totalUnits, units) => {
    let temp = totalUnits;
    let remainingUnits = units;
    let totalTariff = 0;
    let tariffBreakDown = {};

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
                tariffBreakDown[`${slab.start}${slab.end ? '-' + slab.end : '+'}`] = `${unitsConsumedInSlab}units * ₹${slab.perUnitTariff} = ${tariffForSlab}`;
                temp -= unitsConsumedInSlab;
            }
        }
    })
    console.log(tariffBreakDown);

    return totalTariff;
}

const rowHeadings = [
    'Name',
    'Appliance',
    'Common',
    'Total'
]

const Home = () => {
    const [
        rows,
        setRows,
    ] = useState(null);

    const handleClickCalculate = (e) => {
        e.preventDefault();
        let totalUnitsForAppliances = 0;
        Object.keys(fieldValues).forEach(fieldName => {
            totalUnitsForAppliances += parseInt(fieldValues[fieldName]);
        })

        const totalTariff = calculateTariff(totalUnits, totalUnitsForAppliances);

        const fieldTariffs = {};

        let totalTariffForAppliances = 0;
        Object.keys(fieldValues).forEach(fieldName => {
            const tariffForUser = parseInt(fieldValues[fieldName]) * (totalTariff / totalUnitsForAppliances);
            fieldTariffs[fieldName] = Math.round((tariffForUser + Number.EPSILON) * 100) / 100;
            totalTariffForAppliances += fieldTariffs[fieldName];
        })

        const commonTariff = totalCharges - totalTariffForAppliances;
        let commonChargesForEachUser = commonTariff / 4;
        commonChargesForEachUser = Math.round((commonChargesForEachUser + Number.EPSILON) * 100) / 100;

        const tariffDetails = [];

        Object.keys(fieldValues).forEach(fieldName => {
            tariffDetails.push({
                name: fieldName,
                applianceCharges: fieldTariffs[fieldName],
                commonCharges: commonChargesForEachUser,
                totalCharges: commonChargesForEachUser + fieldTariffs[fieldName],
            })
        })

        setRows(tariffDetails);
    }

    const handleFieldChange = (e, fieldName) => {
        setFieldValues({
            ...fieldValues,
            [fieldName]: e.target.value,
        })
    }

    const [
        totalUnits,
        setTotalUnits,
    ] = useState(0);

    const [
        totalCharges,
        setTotalCharges,
    ] = useState(0);

    const [fields, setFields] = useState(['First', 'Second', 'Third']);

    const [
        fieldValues,
        setFieldValues,
    ] = useState({});

    useEffect(() => {
        const initialvalues = { ...fieldValues };
        fields.forEach(field => {
            if (initialvalues[field] === undefined) {
                initialvalues[field] = 0;
            }
            else {
                initialvalues[field] = '';
            }
        })
    }, [fields]);

    return (
        <>
            <Box
                component="form"
                noValidate
                sx={{
                    bgcolor: '#fff',
                    padding: '0.5em',
                    borderRadius: '10px'
                }}
                autoComplete='off'>
                <Typography variant='h4' color='#6e6e6e'>
                    Utility Bill Splitter (WIP)
                </Typography>
                <TextField
                    label="Total units"
                    variant='outlined'
                    fullWidth
                    autoFocus
                    type="number"
                    onChange={(e) => setTotalUnits(parseInt(e.target.value))}
                    sx={{ my: 1 }} />
                <TextField
                    label="Total charges"
                    variant='outlined'
                    fullWidth
                    type="number"
                    onChange={(e) => setTotalCharges(parseInt(e.target.value))}
                    sx={{ my: 1 }} />
                <div id="users" >
                    {
                        fields.map((field) => {
                            return (
                                <TextField
                                    key={field}
                                    label={field}
                                    variant='outlined'
                                    type="number"
                                    onChange={(e) => handleFieldChange(e, field)}
                                    sx={{ my: 1 }} />
                            );
                        })
                    }
                </div>
                <Button
                    type="submit"
                    onClick={handleClickCalculate}
                    variant='contained'>
                    Calculate
                </Button>
                {
                    rows &&
                    <>
                        <Typography variant='h5' color='#6e6e6e'>
                            User wise tariff break-down
                        </Typography>
                        <Table
                            rows={rows}
                            rowHeadings={rowHeadings} />
                    </>
                }
                {
                    rows &&
                    <Button
                        onClick={() => {
                            setRows(null)
                        }}
                        color='error'
                        variant='outlined'>
                        Clear
                    </Button>
                }
            </Box>
        </>
    )
}

export default Home;