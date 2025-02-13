import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'
import { Button, Col, Row, Table } from 'react-bootstrap';
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader } from 'react-bs-datatable';
import WhatsAppAPI from "../../api/WhatsAppAPI";
import moment from 'moment';
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';

const RelatedLocationHistory = (props) => {

    const [body, setBody] = useState([]);
    useEffect(() => {
        async function init() {
            let usertrackings = await WhatsAppAPI.fetchUsertrackingsWithstaffId(props.parent.id);
            if (usertrackings && usertrackings?.length > 0) {
                setBody(usertrackings);
            } else {
                setBody([]);
            }
        }
        init();
    }, []);

    const labels = {
        beforeSelect: " "
    }

    const header = [
        {
            title: 'Login Date Time', prop: 'logindatetime', cell: (row) => (moment(row.logindatetime).format('DD-MM-YYYY hh:mm'))
        },
        {
            title: 'Logout Date Time',
            prop: 'logoutdatetime',
            cell: (row) => (row.logoutdatetime ? moment(row.logoutdatetime).format('DD-MM-YYYY hh:mm A ') : '')
        },
        { title: 'Location', prop: 'location' },
        { title: 'Remarks', prop: 'remarks' },
    ];


    return (
        <>
            {body ?
                <DatatableWrapper body={body} headers={header} paginationOptionsProps={{
                    initialState: {
                        rowsPerPage: 5
                    }
                }}>
                    <Row className="mb-4">
                        <Col
                            xs={12}
                            sm={6}
                            lg={4}
                            className="d-flex flex-col justify-content-start align-items-start"
                        >
                        </Col>
                        <Col
                            xs={12}
                            sm={6}
                            lg={4}
                            className="d-flex flex-col justify-content-start align-items-start"
                        >
                        </Col>
                        <Col
                            xs={12}
                            sm={6}
                            lg={4}
                            className="d-flex flex-col justify-content-end align-items-end"
                        >
                        </Col>
                    </Row>
                    <Table striped className="related-list-table" responsive="sm">
                        <TableHeader />
                        <TableBody />
                    </Table>
                    <Pagination />
                </DatatableWrapper> : ''}
        </>
    )
};

export default RelatedLocationHistory
