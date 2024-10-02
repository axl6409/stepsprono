self.addEventListener('push', function(event) {
  const data = event.data.json();
  console.log('Notification reçue:', data);

  const options = {
    body: data.body,
    icon: '/img/logo-steps-150x143.png',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
