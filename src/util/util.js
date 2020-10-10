export function sendMail(mailData) {
  return new Promise((resolve) => setTimeout(resolve, 2000));
  // return fetch('http://localhost:5001/dlibin-api-ca89a/us-central1/postEmail', { // testing only
  //return fetch('https://us-central1-dlibin-api-ca89a.cloudfunctions.net/postEmail', {
  //   method: 'POST',
  //   body: JSON.stringify(mailData)
  // });
}
