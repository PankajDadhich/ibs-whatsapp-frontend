import React, { useEffect, useState } from "react";
import { Button, Col, Row, Table, Container } from "react-bootstrap";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { ShimmerTable } from "react-shimmer-effects";
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader } from "react-bs-datatable";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Confirm from "../Confirm";
import AddGroupModal from "./AddGroupModal";
import { Link } from "react-router-dom";
import { NameInitialsAvatar } from 'react-name-initials-avatar';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [showHideModel, setShowHideModel] = useState(false);
    const [showAddGroupModal, setShowAddGroupModal] = useState(false);
    const [isSpinner, setIsSpinner] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState([]);
    const [bgColors, setBgColors] = useState(['#d3761f', '#00ad5b', '#debf31', '#239dd1', '#b67eb1', '#d3761f', '#de242f']);
    const [selectedId, setSelectedId] = useState('');
    const [selectedGroupStatus, setSelectedGroupStatus] = useState('');
    let colIndex = 0;

    useEffect(() => {
        fetchGroupRecords();
    }, []);

    const fetchGroupRecords = async () => {
        const result = await WhatsAppAPI.fetchGroups();
        if (result.success) {
            setGroups(result.records);
        } else {
            setGroups([]);
        }
        setIsSpinner(true);
    };


    const labels = { beforeSelect: " " };
    const header = [
        {
            title: "Name",
            prop: "name",
            isFilterable: true,
            cell: (row) => (
                <> <Link state={row} to={`/groups/${row.id}`} className="d-flex align-items-center">
                    <NameInitialsAvatar size='30px' textSize='13px'
                        bgColor={fillBgBolor()}
                        borderWidth="0px"
                        textColor="#fff"
                        name={row?.name}
                    />
                    <span className="mx-2">{row.name}</span>
                </Link>
                </>
            ),
        },
        {
            title: "Group Members",
            prop: "members",
            cell: (row) => {
                const members = row.members || [];
                return (
                    <span>
                        {members.length > 0 && (
                            <>
                                {members.slice(0, 5).map((member, index) => (
                                    <span key={index}>
                                        {member.member_firstname + ' ' + member.member_lastname}
                                        {index < members.slice(0, 5).length - 1 && ", "}
                                    </span>
                                ))}
                                {members.length > 5 && "... "}
                            </>
                        )}
                    </span>
                );
            },
        },
        {
            title: "Status",
            prop: "id",
            cell: (row) => (
                <>
                    <Button
                        className="btn-sm mx-2" title="Update status"
                        variant={row.status ? "success" : "danger"}
                        onClick={() => toggleStatusChangeModal(row.id, row.status)}
                    >
                        {row.status ? 'Active' : 'Inactive'}
                    </Button>
                </>
            ),
        }

    ];

    const createGroup = () => {
        setSelectedGroup([]);
        setShowAddGroupModal(true);
    };

    const toggleStatusChangeModal = (id, status) => {
        setSelectedId(id);
        setSelectedGroupStatus(status);
        setShowHideModel(true);
    };



    const changeGroupStatus = async () => {
        try {
            const newStatus = !selectedGroupStatus;
            const response = await WhatsAppAPI.changeGroupStatus(selectedId, newStatus);
            if (response.success) {
                setShowHideModel(false);
                toast.success('Group status updated successfully.');
                fetchGroupRecords();
            } else {
                setShowHideModel(false);
                toast.error(response.message);
            }
        } catch (error) {
        //    console.log("Error changing status:", error);
        }
    };

    const fillBgBolor = () => {
        colIndex += 1;
        if (colIndex >= bgColors.length)
            colIndex = 0;
        return bgColors[colIndex];
    }

    return (
        <>
            <Container className='mt-5'>
                <Row className='mx-5 text-center g-0'>
                    <Col lg={12} xs={12} sm={12}>
                        <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                                Group Records
                            </span>
                        </div>
                    </Col>
                </Row>
            </Container>


            {isSpinner ?

                <Container className='mb-5'>
                    <Row className='mx-5 g-0'>
                        <Col lg={12} sm={12} xs={12} className="mb-3">
                            <Row className="g-0">
                                <Col lg={12} sm={12} xs={12} >
                                    {groups ? (
                                        <DatatableWrapper
                                            body={groups}
                                            headers={header}
                                            paginationOptionsProps={{ initialState: { rowsPerPage: 10, options: [5, 10, 15, 20], } }}
                                        >
                                            <Row className="mb-2">
                                                <Col lg={4} sm={10} xs={10} className="d-flex flex-col justify-content-end align-items-end" >
                                                    <Filter />
                                                </Col>
                                                <Col lg={4} sm={2} xs={2} className="d-flex flex-col justify-content-start align-items-start" >
                                                    <PaginationOptions labels={labels} />
                                                </Col>

                                                <Col lg={4} sm={12} xs={12} className="mt-2 d-flex flex-col justify-content-end align-items-end"  >
                                                    <Button className="btn btn-sm" variant="outline-secondary" onClick={createGroup}>
                                                        Add New Group
                                                    </Button>
                                                </Col>

                                            </Row>
                                            <Table striped className="data-table" responsive="sm">
                                                <TableHeader />
                                                <TableBody />
                                            </Table>
                                            <Pagination />
                                        </DatatableWrapper>
                                    ) : (
                                        <ShimmerTable row={10} col={4} />
                                    )}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>

                :

                <div className="sk-cube-grid">
                    <div className="sk-cube sk-cube1"></div>
                    <div className="sk-cube sk-cube2"></div>
                    <div className="sk-cube sk-cube3"></div>
                    <div className="sk-cube sk-cube4"></div>
                    <div className="sk-cube sk-cube5"></div>
                    <div className="sk-cube sk-cube6"></div>
                    <div className="sk-cube sk-cube7"></div>
                    <div className="sk-cube sk-cube8"></div>
                    <div className="sk-cube sk-cube9"></div>
                </div>

            }


            {showHideModel && (
                <Confirm
                    show={showHideModel}
                    onHide={() => setShowHideModel(false)}
                    changeGroupStatus={changeGroupStatus}
                    title="Confirm status change?"
                    message="Are you sure you want to change the group's status?"
                    table="group"
                />
            )}


            {showAddGroupModal && (
                <AddGroupModal
                    show={showAddGroupModal}
                    onHide={() => setShowAddGroupModal(false)}
                    fetchGroupRecords={fetchGroupRecords}
                    selectedGroup={selectedGroup}
                />
            )}

            <ToastContainer />
        </>
    );
};

export default Groups;