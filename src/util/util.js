export function sendMail(mailData) {
  // return new Promise((resolve) => setTimeout(resolve, 2000));
  // testing only
  return fetch('http://localhost:5001/dlibin-api-ca89a/us-central1/postEmail', {
    //return fetch('https://us-central1-dlibin-api-ca89a.cloudfunctions.net/postEmail', {
    method: 'POST',
    body: JSON.stringify(mailData)
  });
}
