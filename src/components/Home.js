import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Typography } from '@mui/material';

const users = ['First', 'Second', 'Third'];

const Home = () => {
    const handleClickCalculate = (e, formValues) => {
        e.preventDefault();
        console.log(formValues);
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
                <Typography variant='h4' color='#6e6e6e'>
                    Utility Bill Splitter (WIP)
                </Typography>
                <TextField
                    label="Total units"
                    variant='outlined'
                    fullWidth
                    type="number"
                    sx={{ my: 1 }} />
                <div id="users" >
                    {
                        users.map((user) => {
                            return (
                                <TextField
                                    key={user}
                                    label={user}
                                    variant='outlined'
                                    type="number"
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
            </Box>
        </>
    )
}

export default Home;