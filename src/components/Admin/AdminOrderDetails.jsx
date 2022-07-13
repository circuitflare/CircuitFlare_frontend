import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import "../../styles/adminOrderDetails.css";
import "../../styles/shoppingBasket.css";
import "../../styles/orderDetails.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import moment from "moment";
import axios from "axios";
import { changeToIndianFormat } from "../../utils/changeToIndianFormat";

const AdminOrderDetails = () => {
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(true);

  const [orderDetails, setOrderDetails] = useState(
    sessionStorage.getItem("adminOrderDetails")
      ? JSON.parse(sessionStorage.getItem("adminOrderDetails"))
      : ""
  );
  const [remarks, setRemarks] = useState(
    sessionStorage.getItem("adminOrderDetails")
      ? JSON.parse(sessionStorage.getItem("adminOrderDetails")).remarks
      : []
  );

  const [orderStatus, setOrderStatus] = useState(
    sessionStorage.getItem("adminOrderDetails")
      ? JSON.parse(sessionStorage.getItem("adminOrderDetails")).orderStatus
      : ""
  );

  const [shippingInfoRemarks, setShippingInfoRemarks] = useState(
    sessionStorage.getItem("adminOrderDetails")
      ? JSON.parse(sessionStorage.getItem("adminOrderDetails"))
          .shippingInfoRemarks
      : ""
  );

  const [fieldRemarks, setFieldRemarks] = useState();

  useEffect(() => {
    let adminDetails = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (
      (adminDetails && adminDetails.role !== "admin") ||
      !sessionStorage.getItem("loggedInUser")
    ) {
      setIsAdmin(false);
      Swal.fire({
        title: "User Not Authorized",
        icon: "success",
        confirmButtonText: "Close",
      }).then(() => navigate("/"));
    }
  }, []);

  const handleUpdateStatus = async (purpose) => {
    if(purpose === "orderStatus"){
      if (orderStatus === "") {
        Swal.fire({
          title: "Please enter the order status",
          icon: "info",
          confirmButtonText: "Close",
        });
      } else {
        let response = await axios.put(
          `https://circuit-flare-backend.herokuapp.com/api/admin/update/orderStatus/${orderDetails.orderNumber}`,
          { orderStatus ,purpose},
          {
            "Content-Type": "application/json",
          }
        );
  
        if (response.status === 201) {
          Swal.fire({
            title: "Order Status updated",
            icon: "success",
            confirmButtonText: "Close",
          });
        } else {
          Swal.fire({
            title: "Failed to update the order status",
            icon: "info",
            confirmButtonText: "Close",
          });
        }
      }
    }else{
      if (shippingInfoRemarks === "") {
        Swal.fire({
          title: "Please enter the shipping info remark",
          icon: "info",
          confirmButtonText: "Close",
        });
      } else {
        let response = await axios.put(
          `https://circuit-flare-backend.herokuapp.com/api/admin/update/orderStatus/${orderDetails.orderNumber}`,
          { shippingInfoRemarks,purpose },
          {
            "Content-Type": "application/json",
          }
        );
  
        if (response.status === 201) {
          Swal.fire({
            title: "Shipping Info Remarks updated",
            icon: "success",
            confirmButtonText: "Close",
          });
        } else {
          Swal.fire({
            title: "Failed to update the shipping info remark",
            icon: "info",
            confirmButtonText: "Close",
          });
        }
      }
    }
    
  };

  const handleOnChangeRemarks = (id, remarkValue) => {
    let test = remarks;

    test[id] = remarkValue;

    console.log(test[id]);

    console.log(test);

    setRemarks(test);
  };

  const handleSaveRemarks = async () => {
    try {
      sessionStorage.setItem(
        "adminOrderDetails",
        JSON.stringify({ ...orderDetails, remarks })
      );

      await axios.put(
        `https://circuit-flare-backend.herokuapp.com/api/admin/add/remarks/${
          orderDetails && orderDetails.orderNumber
        }`,
        { remarks },
        {
          "Content-Type": "application/json",
        }
      );

      Swal.fire({
        title: "Remarks saved",
        icon: "success",
        confirmButtonText: "Close",
      });
    } catch (error) {
      Swal.fire({
        title: "Error Saving the remarks",
        icon: "info",
        confirmButtonText: "Close",
      });
    }
  };

  return (
    <div style={isAdmin ? { opacity: "1" } : { opacity: "0" }}>
      <AdminNavbar />
      <div className="aod_container">
        <div className="aod_c_1">
          <div>
            <div>Order Number - </div>{" "}
            <div> &nbsp;{orderDetails && orderDetails.orderNumber}</div>
          </div>
          <div>
            <div>Order Date - </div>{" "}
            <div>
              {" "}
              &nbsp;
              {moment(orderDetails && orderDetails.paidAt).format("DD/MM/YY")}
            </div>
          </div>

          <div>
            <div>Order Value - </div>{" "}
            <div>
              {" "}
              &nbsp;₹{" "}
              {orderDetails &&
                changeToIndianFormat(
                  Number(orderDetails.totalTransactionAmount).toFixed(2)
                )}
            </div>
          </div>
        </div>
        <div className="mt-4 col-xl-7 col-lg-7 col-md-8 col-sm-10 col-10 d-flex justify-content-between">
          <div>
            <h5 style={{ fontSize: "20px", fontWeight: "bold" }}>
              Billing Address:
            </h5>
            <div className="aod_c_addr">
              {orderDetails && orderDetails.usedBillingInfo.firstname}{" "}
              {orderDetails && orderDetails.usedBillingInfo.lastname} <br />{" "}
              {orderDetails && orderDetails.usedBillingInfo.company} <br />{" "}
              {orderDetails && orderDetails.usedBillingInfo.address1} <br />
              {orderDetails && orderDetails.usedBillingInfo.address2} <br />
              {orderDetails && orderDetails.usedBillingInfo.city},{" "}
              {orderDetails && orderDetails.usedBillingInfo.state} <br />{" "}
              {orderDetails && orderDetails.usedBillingInfo.zipCode} <br />
              +91 {orderDetails && orderDetails.usedBillingInfo.phone} <br />
              {orderDetails && orderDetails.usedBillingInfo.email} <br />
              {orderDetails && orderDetails.usedBillingInfo.gstin && (
                <span>
                  GST : {orderDetails && orderDetails.usedBillingInfo.gstin}
                </span>
              )}{" "}
              <br />
              {orderDetails &&
                orderDetails.usedBillingInfo.purchase_order_no && (
                  <span>
                    PO :{" "}
                    {orderDetails &&
                      orderDetails.usedBillingInfo.purchase_order_no}
                  </span>
                )}
            </div>
          </div>
          <div>
            <h5 style={{ fontSize: "20px", fontWeight: "bold" }}>
              Shipping Address:
            </h5>
            <div className="aod_c_addr">
              {orderDetails && orderDetails.deliveryInfo.firstname}{" "}
              {orderDetails && orderDetails.deliveryInfo.lastname} <br />{" "}
              {orderDetails && orderDetails.deliveryInfo.company} <br />
              {orderDetails && orderDetails.deliveryInfo.address1} <br />
              {orderDetails && orderDetails.deliveryInfo.address2} <br />
              {orderDetails && orderDetails.deliveryInfo.city},{" "}
              {orderDetails && orderDetails.deliveryInfo.state} <br />{" "}
              {orderDetails && orderDetails.deliveryInfo.zipCode} <br />
              +91 {orderDetails && orderDetails.deliveryInfo.phone} <br />
              {orderDetails && orderDetails.deliveryInfo.email}
            </div>
          </div>
        </div>
        <div className="aod_c_fields d-flex align-items-center justify-content-between">
          <div className=''>
          <h4>
            Enter the details to update on the customer's order history page
          </h4>
          
          <div>
            <label>Order Status</label>
            <div className="aoc_c_f_order">
              <input
                type="text"
                required
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
              />
              <button onClick={() => handleUpdateStatus("orderStatus")}>Update</button>
            </div>
          </div>
          <div>
            <label>Shipping Info and remarks</label>
            <div className="aoc_c_f_order d-flex align-items-center mb-5">
              <textarea
                className="oc_f_textarea"
                rows="7"
                cols="40"
                type="text"
                required
                value={shippingInfoRemarks}
                onChange={(e) => setShippingInfoRemarks(e.target.value)}
                style={{border:'1px solid #000'}}

              ></textarea>

              <button onClick={() => handleUpdateStatus("shippingInfoRemarks")}>Update</button>
            </div>
          </div>
          </div>
          <div className='d-flex flex-column align-items-center' style={{marginRight:'10%'}}>
            <h4>Attachments: (Invoices, PO, Shipping slips)</h4>
            <button className="btn btn-secondary">Attach Files</button>
          </div>
        </div>
        <div style={{ marginBottom: "40px", width: "90%" }}>
          <table className="sr_table">
            <tr>
              <th style={{ width: "80px" }}>Sort</th>
              <th style={{ width: "400px" }}>Product Details</th>
              <th style={{ width: "400px" }}>Description</th>
              <th style={{ width: "100px" }}>Qty.</th>
              <th style={{ width: "400px" }}>
                Remarks{" "}
                <button
                  className="btn btn-success ms-2"
                  onClick={handleSaveRemarks}
                >
                  Save
                </button>{" "}
              </th>
            </tr>
            {orderDetails &&
              orderDetails.cartItems.map((curr, ind) => (
                <>
                  <OrderCartItems
                    curr={curr}
                    ind={ind}
                    remarks={remarks}
                    handleOnChangeRemarks={handleOnChangeRemarks}
                  />
                  {/* <tr key={ind}>
                  <td>{ind + 1}.</td>
                  <td style={{ textAlign: "center" }}>
                    Mfr. No : &nbsp;&nbsp;{" "}
                    <span>{curr.itemDetails.source_part_number}</span> <br />
                    Mfr. :
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {curr.itemDetails.manufacturer}
                  </td>
                  <td>{curr.itemDetails.description}</td>
                  <td>
                    {" "}
                    <span>{curr.quantity}</span>{" "}
                  </td>
                  <td>
                    <textarea
                      placeholder="Remarks goes here"
                      cols="30"
                      rows="4"
                      className="textarea_remarks"
                      value={remarks && remarks[ind]}
                      onChange={(e) => handleOnChangeRemarks(ind, e)}
                    ></textarea>{" "}
                  </td>
                </tr> */}
                </>
              ))}
          </table>
        </div>
      </div>
    </div>
  );
};

const OrderCartItems = ({ curr, ind, remarks, handleOnChangeRemarks }) => {
  const [productRemark, setProductRemark] = useState(remarks[ind]);

  const handleOnChange = (e) => {
    // console.log(e.target.value)
    setProductRemark(e.target.value);

    handleOnChangeRemarks(ind, e.target.value);
  };

  return (
    <tr key={ind}>
      <td>{ind + 1}.</td>
      <td style={{ textAlign: "center" }}>
        Mfr. No : &nbsp;&nbsp;{" "}
        <span>{curr.itemDetails.source_part_number}</span> <br />
        Mfr. : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {curr.itemDetails.manufacturer}
      </td>
      <td>{curr.itemDetails.description}</td>
      <td>
        {" "}
        <span>{curr.quantity}</span>{" "}
      </td>
      <td>
        <textarea
          placeholder="Remarks goes here"
          cols="30"
          rows="4"
          className="textarea_remarks"
          value={productRemark}
          onChange={(e) => handleOnChange(e)}
        ></textarea>{" "}
      </td>
    </tr>
  );
};

export default AdminOrderDetails;
