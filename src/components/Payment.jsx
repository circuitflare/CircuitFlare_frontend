import React, { useState, useEffect } from "react";
import "./../styles/payment.css";
import { useNavigate } from "react-router-dom";
import { HiArrowNarrowLeft } from "react-icons/hi";
import Swal from "sweetalert2";
import useRazorpay from "react-razorpay";
import axios from "axios";
import { createOrder, loggedInUser } from "../APIcalls";
import { changeToIndianFormat } from "../utils/changeToIndianFormat";

const Payment = () => {
  const navigate = useNavigate();
  const [deliveryInfo, setDeliveryInfo] = useState();
  const [billingInfo, setBillingInfo] = useState();
  const [paidAmount, setPaidAmount] = useState();
  const [cartItems, setCartItems] = useState();
  const [totalBasketItems, setTotalBasketItems] = useState();
  const [isPreviousPaymentDone, setIsPreviousPaymentDone] = useState();
  const [transactionAmount, setTransactionAmount] = useState();
  const [userEmail, setUserEmail] = useState();
  const [userId, setUserId] = useState();
  const [billingInfoIndex, setBillingInfoIndex] = useState(sessionStorage.getItem("billingInfoIndex") ? sessionStorage.getItem("billingInfoIndex") : 0);

  const Razorpay = useRazorpay();

  useEffect(() => {
    if (!sessionStorage.getItem("loggedInUser")) {
      Swal.fire({
        title: "User Is Not Authorized",
        icon: "info",
        confirmButtonText: "Close",
      });
      navigate("/");
    } else {
      let isPreviousPaymentCompleted = JSON.parse(
        sessionStorage.getItem("IsPreviousPaymentDone")
      );
      setIsPreviousPaymentDone(isPreviousPaymentCompleted);

      // console.log(isPreviousPaymentCompleted)

      if (
        isPreviousPaymentCompleted ||
        !sessionStorage.getItem("IsPreviousPaymentDone")
      ) {
        Swal.fire({
          title: "Invalid Page",
          icon: "info",
          confirmButtonText: "Close",
        }).then(() => navigate("/"));
        setIsPreviousPaymentDone(true);
      } else if (
        sessionStorage.getItem("deliveryInfo") &&
        sessionStorage.getItem("billingInfo") &&
        sessionStorage.getItem("totalBasketAmount") &&
        sessionStorage.getItem("totalBasketItems") &&
        sessionStorage.getItem("basketItems") &&
        sessionStorage.getItem("transactionAmount")
      ) {
        setDeliveryInfo(JSON.parse(sessionStorage.getItem("deliveryInfo")));
        setBillingInfo(JSON.parse(sessionStorage.getItem("billingInfo")));
        setPaidAmount(JSON.parse(sessionStorage.getItem("totalBasketAmount")));
        setTotalBasketItems(
          JSON.parse(sessionStorage.getItem("totalBasketItems"))
        );
        setCartItems(JSON.parse(sessionStorage.getItem("basketItems")));
        setTransactionAmount(
          JSON.parse(sessionStorage.getItem("transactionAmount"))
        );

        // console.log(JSON.parse(sessionStorage.getItem("deliveryInfo")))
        // console.log(JSON.parse(sessionStorage.getItem("billingInfo")))
        // console.log(JSON.parse(sessionStorage.getItem("totalBasketAmount")))
        // console.log(JSON.parse(sessionStorage.getItem("totalBasketItems")))
        // console.log(JSON.parse(sessionStorage.getItem("basketItems")))
      }

      setUserEmail(JSON.parse(sessionStorage.getItem("loggedInUser")).email);
      setUserId(JSON.parse(sessionStorage.getItem("userDetails"))._id)
      
      console.log(String(JSON.parse(sessionStorage.getItem("userDetails"))._id))
    }
  }, []);

  const handlePay = async () => {
    let paymentAmount = Number((Number(transactionAmount) * 100).toFixed(0));

    // console.log(paymentAmount)

    var options = {
      key: "rzp_test_pP7ickgViSu9RS", // Enter the Key ID generated from the Dashboard
      amount: paymentAmount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: "INR",
      name: billingInfo.email,
      // image: "https://example.com/your_logo",
      // order_id: payment_order_id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      handler: async (response) => {
        
        let value = await axios.get(
          `https://circuit-flare-backend.herokuapp.com/api/user/getOrderCount/${userEmail}`
        );

        let orderCount = value.data.orderCount

        var date = new Date();

        let orderNum =
          date.getMonth() + 1 < 10
            ? String(date.getFullYear()) +
              "0" +
              String(date.getMonth() + 1) +
              String(date.getDate())
            : String(date.getFullYear()) +
              String(date.getMonth() + 1) +
              String(date.getDate());

        if (orderCount < 10) {
          orderCount = "00" + String(orderCount);
        } else if (orderCount < 100) {
          orderCount = "0" + String(orderCount);
        } else {
          orderCount = String(orderCount);
        }

        orderNum = orderNum + orderCount;

        let billingInfoIndex = sessionStorage.getItem('billingInfoIndex') ? sessionStorage.getItem('billingInfoIndex') : 0

        let orderData = {
          billingInfo,
          usedBillingInfo : billingInfo[billingInfoIndex],
          deliveryInfo,
          totalBasketAmount: paidAmount,
          totalTransactionAmount: transactionAmount,
          totalDiscountAmount: Number(
            sessionStorage.getItem("totalDiscountAmount")
          ),
          cartItems,
          totalBasketItems,
          razorpay_payment_id: response.razorpay_payment_id,
          orderNumber: orderNum,
          userId
        };

        console.log(cartItems)

        const res = await createOrder(orderData);

        if (res.status === 201) {
          sessionStorage.removeItem("totalBasketItems");
          sessionStorage.removeItem("basketItems");
          sessionStorage.removeItem("totalDiscountAmount");
          sessionStorage.removeItem("transactionAmount");
          sessionStorage.setItem("ToExtractCartItemsFromDB",true)


          //deleting the stored basket items in the DB too          
            let user = JSON.parse(sessionStorage.getItem("loggedInUser"));
      
            axios
              .post(
                `https://circuit-flare-backend.herokuapp.com/api/user/store/basket/items/${user.email}`,
                {
                  basketItems:[],
                  totalBasketAmount:0,
                  totalBasketItems: 0,
                },
                {
                  "Content/Type": "application/json",
                }
              )
              .then((res) => console.log(res))
              .catch((err) => console.log(err));          

          //so that user wont route again to /payment page after the payment
          sessionStorage.setItem("IsPreviousPaymentDone", true);

          //set order number in LS to use on /order_confirmed page to send feedback for that particular ordernumber
          sessionStorage.setItem("orderNumber",orderNum)

          Swal.fire({
            title: "Payment Successful",
            icon: "success",
            confirmButtonText: "Close",
          }).then(() => navigate("/order_confirmed"));
        } else {
          //so that user wont route again to /payment page even if the payment fails
          sessionStorage.setItem("IsPreviousPaymentDone", true);

          Swal.fire({
            title: "Error!",
            text: response.error.description,
            icon: "error",
            confirmButtonText: "Close",
          }).then(() => navigate("/checkout"));
        }
      },
      theme: {
        color: "#3399cc",
      },
    };

    var rzp1 = new Razorpay(options);

    rzp1.on("payment.failed", function (response) {
      Swal.fire({
        title: "Error!",
        text: response.error.description,
        icon: "error",
        confirmButtonText: "Close",
      }).then(() => navigate("/checkout"));
    });

    rzp1.open();
  };
  return (
    <div
      className="co_container payment_container"
      style={isPreviousPaymentDone ? { display: "none" } : { display: "block" }}
    >
      <div
        className="back_arrow col-10 mx-auto mt-4"
        onClick={() => navigate("/checkout")}
      >
        <HiArrowNarrowLeft className="arrowIcon" />{" "}
        <span>Back to Checkout</span>{" "}
      </div>
      <div className="payment_details col-12 mx-auto mt-3 d-flex">
        <h2 className="col-12 text-center mt-3">Your Order Summary</h2>
        <div className="p_d_box col-xl-3 col-lg-4 col-md-4 col-sm-6 col-10 mt-1">
          <div className="p_d_box_col">
            <span className="mb-1">Total Number of Items:</span>
            <span className="mb-1">Merchandise :</span>
            <span className="mb-1">GST (18%) :</span>
            <span className="mb-1">Shipping :</span>
            <span className="mb-1">Sub Total :</span>
          </div>
          <div className="p_d_box_col">
            <span
              className="mb-1"
              style={{
                color: "#0053F2",
                textDecoration: "underline",
                cursor: "pointer",
              }}
              onClick={() => navigate("/basket")}
            >
              {JSON.parse(sessionStorage.getItem("basketItems")).length ===
              1 ? (
                <>1 item</>
              ) : (
                <>{`${
                  JSON.parse(sessionStorage.getItem("basketItems")).length
                } item(s)`}</>
              )}
            </span>
            <span className="mb-1">
              ???{" "}
              {paidAmount &&
                changeToIndianFormat(Number(paidAmount).toFixed(2))}
            </span>
            <span className="mb-1">
              ???{" "}
              {paidAmount &&
                changeToIndianFormat(
                  Number(Number(paidAmount) * 0.18).toFixed(2)
                )}
            </span>
            <span className="mb-1">??? 250.00</span>

            <span className="mb-1">
              ???{" "}
              {paidAmount &&
                changeToIndianFormat(
                  Number(
                    Number(paidAmount) + 250 + Number(paidAmount) * 0.18
                  ).toFixed(2)
                )}
            </span>
          </div>
        </div>
        <h5 className="col-12 text-center mt-1" style={{ color: "#068D29" }}>
          Your total savings on this order: ???
          {JSON.parse(sessionStorage.getItem("totalDiscountAmount"))}
        </h5>
        <div className="mt-4 col-xl-7 col-lg-4 col-md-4 col-sm-6 col-10 d-flex justify-content-around">
          <div>
            <h5>
              Billing Information{" "}
              <span
                style={{
                  color: "#0053F2",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/checkout?edit=true")}
              >
                Edit
              </span>{" "}
            </h5>
            <div className="aod_c_addr">
              {billingInfo && billingInfo[billingInfoIndex] && billingInfo[billingInfoIndex].firstname}{" "}
              {billingInfo && billingInfo[billingInfoIndex] && billingInfo[billingInfoIndex].lastname} <br />{" "}
              {billingInfo && billingInfo[billingInfoIndex] && billingInfo[billingInfoIndex].address1}
              <br /> {billingInfo && billingInfo[billingInfoIndex] && billingInfo[billingInfoIndex].city},{" "}
              {billingInfo && billingInfo[billingInfoIndex] && billingInfo[billingInfoIndex].state} <br />{" "}
              {billingInfo && billingInfo[billingInfoIndex] && billingInfo[billingInfoIndex].zipCode} <br />
              +91 {billingInfo && billingInfo[billingInfoIndex] && billingInfo[billingInfoIndex].phone} <br />
              {billingInfo && billingInfo[billingInfoIndex] && billingInfo[billingInfoIndex].email}
            </div>
          </div>
          <div>
            <h5>
              Delivery Information{" "}
              <span
                style={{
                  color: "#0053F2",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/checkout?edit=true")}
              >
                Edit
              </span>{" "}
            </h5>
            <div className="aod_c_addr">
              {deliveryInfo && deliveryInfo.firstname}{" "}
              {deliveryInfo && deliveryInfo.lastname} <br />{" "}
              {deliveryInfo && deliveryInfo.address1}
              <br /> {deliveryInfo && deliveryInfo.city},{" "}
              {deliveryInfo && deliveryInfo.state} <br />{" "}
              {deliveryInfo && deliveryInfo.zipCode} <br />
              +91 {deliveryInfo && deliveryInfo.phone} <br />
              {deliveryInfo && deliveryInfo.email}
            </div>
          </div>
        </div>
        <button onClick={handlePay}>Pay Now</button>
      </div>
      {/* <div className="back_arrow" onClick={() => navigate("/checkout")}>
        <HiArrowNarrowLeft className="arrowIcon" />{" "}
        <span>Back to Checkout</span>{" "}
      </div> */}
    </div>
  );
};

export default Payment;
