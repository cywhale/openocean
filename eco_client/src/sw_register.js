//import { route } from 'preact-router'; //not used for location.reload //seems need not to handle that
//Modulize it so that can prevent esm/commonjs build error
//refer: https://github.com/fastify/fastify/issues/2847#issuecomment-777698312
//https://felixgerschau.com/how-to-make-your-react-app-a-progressive-web-app-pwa/
export default function sw_register() {
  //https://web.dev/offline-fallback-page/
  if (process.env.NODE_ENV === 'production') {
    window.addEventListener("load", () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: './' })
        .then((registration) => {
         console.log("service worker registration successful", registration);
        })
        .catch((err) => {
         console.log("service worker registration failed", err);
        });
      }
    });
//Seems need not to handle that because most operation is client-side, and reload last all current state
/*  window.addEventListener('online', async () => {
      await window.location.reload(); //will lost all preact state
      route('/');
      const sessionx = process.env.NODE_ENV === 'production'? 'session/' : 'sessioninfo/';

      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Accept', 'application/json');

      try {
        await fetch(sessionx + 'verify', {
          method: 'POST',
          mode: 'same-origin',
          redirect: 'follow',
          credentials: 'include',
          withCredentials: true,
          headers: headers,
          //body: JSON.stringify({action: 'verify'})
        })
      //.then((res) => {
        //if (!res.ok) {
        //  alert("Sorry. We have trouble when checking token authority internally.\r\nYou still can login and use prefer$
        //}
        //return(res.ok);
      //});
      } catch(err) {
        console.log("Verify failed: ", err);
      //return(false);
      }
    });*/
  }
}
