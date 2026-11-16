const numberFrom = (value) => Number(value);

export function validateHotel(data) {
  const errors = {};
  const title = String(data.title ?? "").trim();
  const description = String(data.description ?? "").trim();
  const latitude = numberFrom(data.latitude);
  const longitude = numberFrom(data.longitude);
  const price = numberFrom(data.price);

  if (!title) errors.title = "Hotel name is required.";
  else if (title.length > 140) errors.title = "Hotel name must be 140 characters or fewer.";

  if (!description) errors.description = "Description is required.";
  else if (description.length > 2000) errors.description = "Description must be 2000 characters or fewer.";

  if (data.latitude === "" || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    errors.latitude = "Enter a valid latitude between -90 and 90.";
  }

  if (data.longitude === "" || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    errors.longitude = "Enter a valid longitude between -180 and 180.";
  }

  if (data.price === "" || !Number.isFinite(price) || price < 0) {
    errors.price = "Enter a valid price of zero or more.";
  }

  return {
    errors,
    values: { title, description, latitude, longitude, price }
  };
}
