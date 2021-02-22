export default async function sessionInfo(url, action, ucode, method='POST', body, //={action: action},
                                          sendAlert, userCallback) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');

    try {
      await fetch(url, {
        method: method,
        mode: 'same-origin',
        redirect: 'follow',
        credentials: 'include',
        withCredentials: true,
        headers: headers,
        body: JSON.stringify(body)
        //{ action: action })
      })
      .then((res) => {
        userCallback((preState) => ({
          ...preState,
          session: action,
          token: res.ok? ucode: '',
        }))
        if (!res.ok && sendAlert) {
          alert("Sorry. We have trouble when checking token authority internally.\r\nYou still can login and use preferred settings that have no privacy/authroized issues.\r\nPlease contact us if this situation continuously happens.");
        }
        return(res.ok);
      });
    } catch(err) {
      console.log("Auth failed when ", action, err);
      return(false);
    }
  };

