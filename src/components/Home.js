import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TextField from '@mui/material/TextField';
import { Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Table from './table/Table';
import { splitBill, formatNumber, parseNumber } from '../utils/calculations';

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

const defaultNames = [
    'First',
    'Second',
    'Third',
    'Fourth',
    'Fifth',
    'Sixth',
    'Seventh',
    'Eighth',
    'Ninth',
    'Tenth'
]

const getNextUserName = (namesInUse) => {
    const inUse = new Set(namesInUse);
    return defaultNames.find((name) => !inUse.has(name)) || `User ${namesInUse.length + 1}`;
}

const Home = () => {
    // --- State ---
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('utility-bill-users');
        if (saved) return JSON.parse(saved);
        return [
            { id: 0, name: 'First', units: '' },
            { id: 1, name: 'Second', units: '' },
            { id: 2, name: 'Third', units: '' },
        ];
    });

    const [totalUnits, setTotalUnits] = useState('');
    const [totalCharges, setTotalCharges] = useState('');
    const [totalPersons, setTotalPersons] = useState('4');
    
    const [rows, setRows] = useState(null);
    const [tariffRows, setTariffRows] = useState(null);
    const [summary, setSummary] = useState(null);

    const [showSettings, setShowSettings] = useState(false);
    const [tempNames, setTempNames] = useState([]);

    // Sync tempNames with initial users
    useEffect(() => {
        setTempNames(users.map(u => u.name));
    }, [users]);

    // --- Handlers ---
    const handleAddUser = () => {
        setUsers(prev => [...prev, {
            id: Date.now(),
            name: getNextUserName(prev.map(u => u.name)),
            units: ''
        }]);
    };

    const handleRemoveUser = (id) => {
        setUsers(prev => prev.filter(u => u.id !== id));
    };

    const handleUserUnitsChange = (id, value) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, units: value } : u));
    };

    const handleOpenSettings = () => {
        setTempNames(users.map(u => u.name));
        setShowSettings(true);
    };

    const handleSaveUsers = () => {
        setUsers(prev => prev.map((user, idx) => ({
            ...user,
            name: tempNames[idx] || user.name
        })));
        localStorage.setItem('utility-bill-users', JSON.stringify(users));
        setShowSettings(false);
    };

    const handleClickCalculate = (e) => {
        e.preventDefault();
        const result = splitBill(totalUnits, totalCharges, users, totalPersons);
        setRows(result.userRows);
        setTariffRows(result.tariffBreakDown);
        setSummary(result.summary);
    };

    const handleClear = () => {
        setRows(null);
        setTariffRows(null);
        setSummary(null);
    };

    const liveApplianceUnits = users.reduce((sum, user) => sum + parseNumber(user.units), 0);
    const personsNumber = parseInt(totalPersons, 10) || 0;
    const hasPersonsMismatch = personsNumber >= 1 && users.length > personsNumber;

    // --- Render ---
    if (showSettings) {
        return (
            <Box
                component="form"
                noValidate
                sx={{ bgcolor: '#fff', padding: '0.5em', borderRadius: '10px', display: 'flex', flexDirection: 'column' }}
                autoComplete='off'>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant='h4' color='#6e6e6e'>Settings</Typography>
                    <IconButton onClick={() => setShowSettings(false)}><CloseIcon /></IconButton>
                </div>
                <Typography variant='h6' style={{ color: '#6e6e6e', width: 'fit-content' }}>Modify Usernames.</Typography>
                <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '16px', justifyContent: 'space-between' }}>
                    {users.map((user, index) => (
                        <TextField
                            key={user.id}
                            label={user.name}
                            variant='outlined'
                            type="text"
                            value={tempNames[index]}
                            onChange={(e) => {
                                const newNames = [...tempNames];
                                newNames[index] = e.target.value;
                                setTempNames(newNames);
                            }}
                            sx={{ my: 1, flexGrow: 1, minWidth: '180px' }} 
                        />
                    ))}
                </div>
                <Button type="submit" onClick={handleSaveUsers} style={{ width: 'fit-content', mt: 1 }} variant='contained'>
                    Save
                </Button>
            </Box>
        );
    }

    return (
        <>
            <Box
                component="form"
                noValidate
                sx={{ bgcolor: '#fff', padding: '0.5em', borderRadius: '10px' }}
                autoComplete='off'>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant='h4' color='#6e6e6e'>Utility Bill Splitter</Typography>
                    <IconButton onClick={handleOpenSettings}><SettingsIcon /></IconButton>
                </div>

                <TextField
                    label="Total units"
                    variant='outlined'
                    fullWidth
                    autoFocus
                    type="number"
                    value={totalUnits}
                    onChange={(e) => setTotalUnits(e.target.value)}
                    sx={{ my: 1 }} />
                <TextField
                    label="Total charges"
                    variant='outlined'
                    fullWidth
                    type="number"
                    value={totalCharges}
                    onChange={(e) => setTotalCharges(e.target.value)}
                    sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        label="Total persons"
                        variant='outlined'
                        type="number"
                        value={totalPersons}
                        onChange={(e) => setTotalPersons(e.target.value)}
                        inputProps={{ min: 1, step: 1 }}
                        helperText={
                            hasPersonsMismatch
                                ? `You have ${users.length} users with appliance readings, but only ${personsNumber} total persons.`
                                : 'People in the household the bill is shared among'
                        }
                        error={hasPersonsMismatch}
                        sx={{ flexGrow: 1 }} 
                    />
                </Box>

                <Typography variant='h6' color='#6e6e6e' sx={{ mt: 2, mb: 1, width: 'fit-content' }}>
                    Personal appliance readings (units)
                </Typography>

                <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '16px', justifyContent: 'space-between' }}>
                    {users.map((user) => (
                        <Box key={user.id} sx={{ display: 'flex', alignItems: 'center', my: 1, flexGrow: 1, minWidth: '180px' }}>
                            <TextField
                                label={user.name}
                                variant='outlined'
                                type="number"
                                value={user.units}
                                onChange={(e) => handleUserUnitsChange(user.id, e.target.value)}
                                fullWidth 
                            />
                            <IconButton
                                size="small"
                                onClick={() => handleRemoveUser(user.id)}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                </div>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 2 }}>
                    <Button type="button" onClick={handleAddUser} variant='outlined' startIcon={<PersonAddIcon />}>
                        Add user
                    </Button>
                    <Button type="submit" onClick={handleClickCalculate} variant='contained'>
                        Calculate
                    </Button>
                    {rows && <Button onClick={handleClear} color='error' variant='outlined'>Clear</Button>}
                </Box>

                {summary && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '10px' }}>
                        <Typography variant='h6' color='#6e6e6e' gutterBottom>How the bill is calculated</Typography>
                        <Box component="ol" sx={{ m: 0, pl: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography component="li" variant="body1">
                                <strong>Appliance units:</strong> all personal appliance readings are added up
                                {(summary.totalApplianceUnits > 0 ? ` (${formatNumber(summary.totalApplianceUnits)} units)` : '')}.
                            </Typography>
                            <Typography component="li" variant="body1">
                                <strong>Appliance tariff:</strong> those units are priced slab-wise, starting from the highest slab,
                                to get the part of the bill caused by personal appliances {summary.applianceTariff > 0 ? ` (${formatNumber(summary.applianceTariff)})` : ''}.
                            </Typography>
                            <Typography component="li" variant="body1">
                                <strong>Common charges:</strong> the rest of the bill (total charges &minus; appliance
                                tariff) {summary.commonTariff > 0 ? ` (${formatNumber(summary.commonTariff)})` : ''} is split equally among{' '}
                                {summary.persons} people, so each pays {formatNumber(summary.commonPerPerson)}.
                            </Typography>
                            <Typography component="li" variant="body1">
                                <strong>Per person:</strong> each person pays their equal common share plus their share of
                                the appliance tariff, in proportion to their appliance units. People without a personal
                                appliance pay only their common share.
                            </Typography>
                        </Box>
                    </Box>
                )}
                <br />
                {tariffRows && (
                    <>
                        <Typography variant='h5' color='#6e6e6e'>Slab wise tariff break-down.</Typography>
                        <Table rows={tariffRows} rowHeadings={tariffHeadings} />
                    </>
                )}
                <br />
                {rows && (
                    <>
                        <Typography variant='h5' color='#6e6e6e'>Person wise tariff break-down</Typography>
                        <Table rows={rows} rowHeadings={rowHeadings} />
                    </>
                )}
            </Box>
        </>
    )
}

export default Home;
