import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    orderNumber: {
      type: String,
      unique: true,
      required: false,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product is required"],
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price cannot be negative"],
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingAddress: {
      street: {
        type: String,
        required: function () {
          return this.deliveryType === "delivery";
        },
        trim: true,
        maxlength: [200, "Street address cannot exceed 200 characters"],
      },
      city: {
        type: String,
        required: function () {
          return this.deliveryType === "delivery";
        },
        trim: true,
        maxlength: [50, "City name cannot exceed 50 characters"],
      },
      postalCode: {
        type: String,
        required: function () {
          return this.deliveryType === "delivery";
        },
        trim: true,
        maxlength: [10, "Postal code cannot exceed 10 characters"],
      },
    },

    paymentMethod: {
      type: String,
      required: function () {
        return this.deliveryType === "delivery";
      },
      enum: {
        values: ["cash_on_delivery", "bank_transfer"],
        message:
          "Payment method must be either cash_on_delivery or bank_transfer",
      },
      default: function () {
        return this.deliveryType === "delivery"
          ? "cash_on_delivery"
          : undefined;
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
    deliveryType: {
      type: String,
      required: [true, "Delivery type is required"],
      enum: ["delivery", "pickup", "in_store"],
      default: "delivery",
    },

    shippingCost: {
      type: Number,
      default: function () {
        return this.deliveryType === "pickup" ||
          this.deliveryType === "in_store"
          ? 0
          : 7.0;
      },
      min: [0, "Shipping cost cannot be negative"],
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{8}$/, "Le numéro doit contenir exactement 8 chiffres"],
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    confirmedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });

// Générer un numéro de commande unique avant sauvegarde
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `TUN-${Date.now()}-${(count + 1)
      .toString()
      .padStart(4, "0")}`;
  }
  next();
});

// Calculer le total avant sauvegarde
orderSchema.pre("save", function (next) {
  // Calculer les sous-totaux des items
  this.items.forEach((item) => {
    item.subtotal = item.price * item.quantity;
  });

  // Calculer le total
  const itemsTotal = this.items.reduce(
    (total, item) => total + item.subtotal,
    0
  );
  this.totalAmount = itemsTotal + this.shippingCost;

  next();
});

// Méthode pour mettre à jour le statut
orderSchema.methods.updateStatus = function (newStatus) {
  this.status = newStatus;

  switch (newStatus) {
    case "confirmed":
      this.confirmedAt = new Date();
      break;
    case "shipped":
      this.shippedAt = new Date();
      break;
    case "delivered":
      this.deliveredAt = new Date();
      break;
    case "cancelled":
      this.cancelledAt = new Date();
      break;
  }

  return this.save();
};

const Order = mongoose.model("Order", orderSchema);

export default Order;
