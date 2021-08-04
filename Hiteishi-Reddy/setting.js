/*
 * Copyright (c) 2021 Included. All rights reserved.
 */

import {Component} from 'react';
import { fetchJsonWithAuth } from '../../auth/Util.js';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { TableSortLabel } from '@material-ui/core';
import './StageMappingSettings.css';



const invertDirection = { asc: "desc", desc: "asc" };
const columnOne = 'Stage';
const columnTwo ='Canonical Stage';

const sortByColumn = ( items, sortDirection, columnToSort ) =>
    items.sort( ( a, b ) =>
    {
        const sortProp = columnToSort === columnOne ? 'key' : 'value';
        const nameA = a[ sortProp ].toUpperCase();
        const nameB = b[ sortProp ].toUpperCase();

        if ( nameA < nameB )
        {
            return sortDirection === 'asc' ? -1 : 1;
        }

        if (nameA > nameB)
        {
            return sortDirection === 'asc' ? 1 : -1;
        }

        return 0;
    } );


class StageMappingSettings extends Component
{
    constructor( props ) 
    {
        super( props );
        
        this.state = 
        {
            mappings: {},
            isAnyDropdownUpdated: true,
            restoreDefault: true,
            columnToSort: columnOne,
            sortDirection: "asc"
        };
        
        this.handleDropdownChange = this.handleDropdownChange.bind( this );
        this.handleUpdate = this.handleUpdate.bind( this );
        this.handleRestoreDefaults = this.handleRestoreDefaults.bind( this );
        this.handleSort = this.handleSort.bind(this);
     }


    componentDidMount()
    {
        fetchJsonWithAuth('data/application-stages')
        .then
        (
            json => 
            {   
                 this.setState
                 (
                     {
                      
                         mappings:json.mappings || []
                       
                     }
                 )
            }   
        );               
    };   
    
    
    handleDropdownChange(e) 
    {
        const updatedMapState = {...this.state.mappings};
        updatedMapState[e.target.id] = e.target.value;
        this.setState(
        {
            mappings: updatedMapState,
            isAnyDropdownUpdated: false,
            restoreDefault: false
        });
    }

    handleUpdate(event)
    {
        fetchJsonWithAuth( "data/application-stages", "PUT", {mappings:this.state.mappings}  )
        .then
        (
            json => 
            {
                this.setState
                (
                    {
                       mappings: json.mappings,
                       isAnyDropdownUpdated: true
                       
                    }
                );
            }
        );
    }
    
     handleRestoreDefaults(event)
     {
        fetchJsonWithAuth( "data/application-stages/reset", "GET" )
        .then
        (
            json => 
            {

                this.setState
                (
                    {
                       mappings: json.mappings,
                       restoreDefault: true
                    }
                );
            }
        );
    }
    
    
    handleSort(columnToSort)
    {
        this.setState( ( oldState ) => (
        {
            columnToSort: columnToSort,
            sortDirection: oldState.columnToSort === columnToSort
                ? invertDirection[ oldState.sortDirection ]
                : 'asc'
        } ) );
    }


    
    render()
    {   
        const mappings = Object.keys(this.state.mappings).map( key => ( { key, value: this.state.mappings[key] } ) );
        const sortedMappings = sortByColumn(mappings, this.state.sortDirection, this.state.columnToSort );

        return(
            <div className="stage-mapping-table-container">
                <div className="stage-mapping-heading">Stage Mapping</div>
                    <TableContainer align="center" style={{width:"600px", height: "600px", overflow: "auto" }} component={Paper}>
                        <Table style={{width:"600px"}} stickyHeader aria-label="sticky table">
                           <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <TableSortLabel
                                            active={columnOne === this.state.columnToSort}
                                            direction={this.state.sortDirection}
                                            onClick={ event => this.handleSort(columnOne) }
                                        >
                                            <h3 className="stage-mapping-table-title">{columnOne}</h3>
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={columnTwo === this.state.columnToSort}
                                            direction={this.state.sortDirection}
                                            onClick={ event => this.handleSort(columnTwo) }
                                        >
                                            <h3 className="stage-mapping-table-title">{columnTwo}</h3>
                                        </TableSortLabel>
                                    </TableCell>
                                </TableRow> 
                            </TableHead>
                            <TableBody>
                                {
                                    sortedMappings.map( ( item, index ) =>
                                        <TableRow key={ index }>
                                            <TableCell>{ item.key }</TableCell>
                                            <TableCell>
                                                <select className="stage-mapping-table-select"
                                                        value={ item.value }
                                                        name="canonical Stage"
                                                        id={ item.key }
                                                        onChange={this.handleDropdownChange}
                                                >
                                                    <option value="APPLIED">Applied</option>
                                                    <option value="SCREENING">Screening</option>
                                                    <option value="INTERVIEW">Interview</option>
                                                    <option value="OFFER">Offer</option>
                                                    <option value="HIRED">Hired</option>
                                                </select>
                                            </TableCell>
                                        </TableRow>
                                    )
                                }
                             </TableBody>
                        </Table>
                     </TableContainer>
                     <div className="stage-mapping-table-buttons">
                        <Button  
                                variant="contained" 
                                color="primary" 
                                onClick={this.handleUpdate}
                                disabled={this.state.isAnyDropdownUpdated}
                         >
                            Update
                         </Button>
                         <Button  
                                 variant="contained" 
                                 color="secondary" 
                                 onClick={this.handleRestoreDefaults} 
                                 disabled={this.state.restoreDefault}
                         >
                            Restore Defaults
                         </Button>
                     </div>    
            </div>
        );
    } 
    
}

export {StageMappingSettings};
