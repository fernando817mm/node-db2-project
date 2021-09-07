const { getById } = require("./cars-model");
const vinValidator = require("vin-validator");
const db = require("../../data/db-config");

const checkCarId = (req, res, next) => {
  getById(req.params.id)
    .then((car) => {
      car
        ? ((req.car = car), next())
        : next({
            status: 404,
            message: `car with id ${req.params.id} is not found`,
          });
    })
    .catch(next);
};

const checkCarPayload = (req, res, next) => {
  const car = req.body;
  const { vin, make, model, mileage } = car;
  const error = { status: 400 };
  if (vin === undefined) {
    error.message = "vin is missing";
  } else if (make === undefined) {
    error.message = "make is missing";
  } else if (model === undefined) {
    error.message = "model is missing";
  } else if (mileage === undefined) {
    error.message = "mileage is missing";
  }

  error.message ? next(error) : next();
};

const checkVinNumberValid = (req, res, next) => {
  const car = req.body;
  const { vin } = car;
  const valid = vinValidator.validate(vin);
  valid
    ? next()
    : next({
        status: 400,
        message: `vin ${vin} is invalid`,
      });
};

const checkVinNumberUnique = (req, res, next) => {
  db("cars")
    .where("vin", req.body.vin.trim())
    .first()
    .then((existing) => {
      existing
        ? next({
            status: 400,
            message: `vin ${req.body.vin} already exists`,
          })
        : next();
    })
    .catch(next);
};

module.exports = {
  checkCarId,
  checkCarPayload,
  checkVinNumberValid,
  checkVinNumberUnique,
};
