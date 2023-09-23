import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import { Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
// import { Link } from 'react-router-dom';
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
                    slab: `${slab.start}${slab.end ? '-' + slab.end : '+'}`,
                    units: unitsConsumedInSlab,
                    rate: slab.perUnitTariff,
                    tariff: tariffForSlab
                })
                temp -= unitsConsumedInSlab;
            }
        }
    })
    tariffBreakDown.push({
        slab: 'Total',
        units,
        rate: '-',
        tariff: totalTariff,
    })
    console.table(tariffBreakDown);

    return { totalTariff, tariffBreakDown };
}

const rowHeadings = [
    'Name',
    'Appliance',
    'Common',
    'Total'
]

const tariffHeadings = [
    'Slab',
    'Units',
    'Rate',
    'Tariff'
]

const Home = () => {
    const [
        rows,
        setRows,
    ] = useState(null);

    const [
        tariffRows,
        setTariffRows,
    ] = useState(null);

    const handleClickCalculate = (e) => {
        e.preventDefault();
        let totalUnitsForAppliances = 0;
        Object.keys(fieldValues).forEach(fieldName => {
            totalUnitsForAppliances += parseInt(fieldValues[fieldName]);
        })

        const { totalTariff, tariffBreakDown } = calculateTariff(totalUnits, totalUnitsForAppliances);

        setTariffRows(tariffBreakDown);

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

    const tempFieldNames = useRef([])

    const handleFieldNameChange = (e, fieldIndex) => {
        tempFieldNames.current[fieldIndex] = e.target.value;
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

    const handleClickSaveUsers = (e) => {
        e.preventDefault();
        setFields([...tempFieldNames.current]);
    }

    const [
        showSettings,
        setShowSettings,
    ] = useState(false);

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

    if (showSettings) {
        return (
            <>
                <Box
                    component="form"
                    noValidate
                    sx={{
                        bgcolor: '#fff',
                        padding: '0.5em',
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    autoComplete='off'>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant='h4' color='#6e6e6e'>
                            Settings
                        </Typography>
                        <IconButton onClick={() => setShowSettings(!showSettings)}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <Typography variant='h6' style={{ color: '#6e6e6e', width: 'fit-content' }}>
                        Modify Usernames.
                    </Typography>
                    <div
                        id="users"
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            columnGap: '16px',
                            justifyContent: 'space-between',
                        }} >
                        {
                            fields.map((field, index) => {
                                return (
                                    <TextField
                                        key={field}
                                        label={field}
                                        variant='outlined'
                                        type="text"
                                        onChange={(e) => handleFieldNameChange(e, index)}
                                        sx={{ my: 1, flexGrow: 1 }} />
                                );
                            })
                        }
                    </div>
                    <Button
                        type="submit"
                        onClick={handleClickSaveUsers}
                        style={{ width: 'fit-content' }}
                        variant='contained'>
                        Save
                    </Button>
                    <br />
                </Box>
            </>
        );
    }

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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant='h4' color='#6e6e6e'>
                        Utility Bill Splitter
                    </Typography>
                    <IconButton onClick={() => setShowSettings(!showSettings)}>
                        <SettingsIcon />
                    </IconButton>
                    {/* <Link to="/settings">
                    <SettingsIcon />
                    </Link> */}
                </div>
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
                <div
                    id="users"
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        columnGap: '16px',
                        justifyContent: 'space-between',
                    }} >
                    {
                        fields.map((field) => {
                            return (
                                <TextField
                                    key={field}
                                    label={field}
                                    variant='outlined'
                                    type="number"
                                    onChange={(e) => handleFieldChange(e, field)}
                                    sx={{ my: 1, flexGrow: 1 }} />
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
                <br />
                {
                    tariffRows &&
                    <>
                        <Typography variant='h5' color='#6e6e6e'>
                            Slab wise tariff break-down.
                        </Typography>
                        <Table
                            rows={tariffRows}
                            rowHeadings={tariffHeadings} />
                    </>
                }
                <br />
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
                            setTariffRows(null)
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