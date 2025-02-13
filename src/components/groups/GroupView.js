import React, { useState, useEffect } from "react";
import { Button, Col, Container, Row, Table, } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import Confirm from "../Confirm";
import { DatatableWrapper, Filter, Pagination, TableBody, TableHeader } from "react-bs-datatable";
import AddGroupModal from "./AddGroupModal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GroupView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [group, setGroup] = useState(location.state ? location.state : {});
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [showHideModel, setShowHideModel] = useState(false);
  useEffect(() => {
    fetchGroup();
  }, []);

  const fetchGroup = () => {

    async function initGroup() {
      let result = await WhatsAppAPI.fetchGroupsById(group.id);
      if (result.success) {
        setGroup(result.records);
      } else {
        setGroup([]);
      }
    }
    initGroup();
  };


  const handleBack = () => {
    navigate('/groups');
  };


  const handleAddMember = () => {
    setShowAddGroupModal(true);
  };


  const deleteRecord = (row) => {
    setSelectedId(row)
    setShowHideModel(true);
  };


  const deleteGroupMember = async () => {
    try {
      const response = await WhatsAppAPI.deleteGroupMember(selectedId);
      if (response.success) {
        setShowHideModel(false);
        toast.success('Group Member deleted successfully.');
        fetchGroup();
      } else {
        setShowHideModel(false);
        toast.error(response.error.message);
      }
    } catch (error) {
  //    console.log("Error removing member:", error);

    }
  };

  const renderTable = () => {
    const header = [
      {
        title: "Member Name",
        prop: 'full_name', isFilterable: true,
        cell: (row) => (
          <>{row.member_firstname} {row.member_lastname}</>
        ),
      },
      { title: "WhatsApp Number", prop: "whatsapp_number" },
      {
        title: "Actions",
        prop: "groupmemberid",
        cell: (row) => (
          <>
            {group.members?.length > 1 && (
              <Button className="btn-sm mx-2" variant="danger" onClick={() => deleteRecord(row.groupmemberid)} >
                Remove
              </Button>
            )}
          </>
        ),
      },
    ];
    const membersWithFullName = group.members?.map((member) => ({
      ...member,
      full_name: `${member.member_firstname} ${member.member_lastname}`
    }));

    return (
      <>
        {group.members ? (
          <DatatableWrapper
            body={membersWithFullName}
            headers={header}
            paginationOptionsProps={{
              initialState: { rowsPerPage: 10, },
            }}
          >
            <Row className="mb-2 d-flex justify-content-start">
              <Col lg={3} sm={6} xs={6} className="d-flex flex-col justify-content-start align-items-start" >
                <Filter />
              </Col>
            </Row>

            <Table striped className="data-table" responsive="sm" >
              <TableHeader />
              <TableBody />
            </Table>
            <Pagination />
          </DatatableWrapper>
        )
          : (
            ''
          )}
      </>
    );
  };

  return (
    <>
      <Container className='mt-5'>
        <Row className='mx-5 section-header'>
          <Col lg={12} sm={12} xs={12}>
            <Row className='view-form-header align-items-center'>
              <Col lg={8} sm={8} xs={8}>
                Group Name
                <h5>{group?.name ? group.name + " " : <>&nbsp;</>}</h5>
              </Col>
              <Col lg={4} sm={4} xs={4} className="text-end">
                <Button className="btn-sm mx-2" variant="outline-light" onClick={handleBack}>
                  Back
                </Button>
                <Button className="btn-sm mx-2" variant="outline-light" onClick={handleAddMember}>
                  Add More Members
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      {/* <Container className='mt-1'>
        <Row className='g-0 mx-5'>
          <Col lg={12} className="section-header">
            <span className='mx-2'>Group Members Details</span>
          </Col>
        </Row>
      </Container> */}


      <Container className='mt-2 mb-5'>
        <Row className='g-0 mx-5'>
          <Col lg={12} sm={12} xs={12}>
            <Row className="g-0 mt-2">
              <Col lg={12} sm={12} xs={12} >
                {renderTable()}
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>


      {showHideModel && (
        <Confirm
          show={showHideModel}
          onHide={() => setShowHideModel(false)}
          deleteGroupMember={deleteGroupMember}
          title="Confirm delete?"
          message="You are going to delete the record. Are you sure?"
          table="group_member"
        />
      )}

      {showAddGroupModal && (
        <AddGroupModal
          show={showAddGroupModal}
          onHide={() => setShowAddGroupModal(false)}
          fetchGroupRecords={fetchGroup}
          selectedGroup={group}
        />
      )}

      <ToastContainer />
    </>
  );
};

export default GroupView;