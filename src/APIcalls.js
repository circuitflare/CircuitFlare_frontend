import axios from "axios";

export const registerUser = async (user) => {
  let response = await axios.post(
    "https://circuit-flare-backend.herokuapp.com/api/user/register",
    user,
    {
      headers: {
        "Content-Type": "application/json",
      }
    }
  );

    //to store token & user info in sessionStorage 
    sessionStorage.setItem("loginToken", response.data.token);
    sessionStorage.setItem("userDetails", JSON.stringify(response.data.user));

    return response;
};

export const loginUser = async (user) => {
  let response = await axios.post(
    "https://circuit-flare-backend.herokuapp.com/api/user/login",
    user,
    {
      headers: {
        "Content-Type": "application/json",
      }
    }
  );

  //to store token & user info in sessionStorage 
  sessionStorage.setItem("loginToken", response.data.token);
  sessionStorage.setItem("userDetails", JSON.stringify(response.data.user));

  return response;
};

export const loggedInUser = async () => {
  return await axios.get(
    "https://circuit-flare-backend.herokuapp.com/api/user/me",
  );
};

export const logoutUser = async (user) => {

  sessionStorage.removeItem("loginToken")
  sessionStorage.removeItem("userDetails")


  return await axios.get(
    "https://circuit-flare-backend.herokuapp.com/api/user/logout",
  );
};

export const forgotUnP = async (email, forgotValue) => {
  if (forgotValue === "password") {
    return await axios.post(
      "https://circuit-flare-backend.herokuapp.com/api/user/password/forgot",
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } else {
    return await axios.post(
      "https://circuit-flare-backend.herokuapp.com/api/user/username/forgot",
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

export const resetUnP = async (
  inputVal,
  confirmInputVal,
  forgotValue,
  token
) => {
  if (forgotValue === "password") {
    return await axios.put(
      `https://circuit-flare-backend.herokuapp.com/api/user/password/reset/${token}`,
      { password: inputVal, confirmPassword: confirmInputVal },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } else {
    return await axios.put(
      `https://circuit-flare-backend.herokuapp.com/api/user/username/reset/${token}`,
      { username: inputVal, confirmUsername: confirmInputVal },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

export const createOrder = async (orderData) => {
  return await axios.post(
    "https://circuit-flare-backend.herokuapp.com/api/order/create/order",
    orderData,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const getUserOrders = async (id) => {
  return await axios.post(
    "https://circuit-flare-backend.herokuapp.com/api/order/get/user/orders",{id}
  );
};

export const changePw = async (passwords) => {
  return await axios.put(
    "https://circuit-flare-backend.herokuapp.com/api/user/me/update_password",
    passwords,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

/* admin apis */

export const adminLogin = async (userData) => {
  let response = await axios.post(
    "https://circuit-flare-backend.herokuapp.com/api/admin/login",
    userData,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  //to store token & user info in sessionStorage 
  sessionStorage.setItem("loginToken", response.data.token);
  sessionStorage.setItem("userDetails", JSON.stringify(response.data.user));

  return response;
};

export const adminOrders = async () => {
  return await axios.get(
    "https://circuit-flare-backend.herokuapp.com/api/admin/orders"
  );
};

export const adminForgotPw = async () => {
  return await axios.get(
    "https://circuit-flare-backend.herokuapp.com/api/admin/forgot/password"
  );
};

export const adminResetPw = async (inputVal, confirmInputVal, token) => {
  return await axios.put(
    `https://circuit-flare-backend.herokuapp.com/api/admin/reset/password/${token}`,
    { password: inputVal, confirmPassword: confirmInputVal },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
