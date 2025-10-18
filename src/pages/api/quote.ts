import type { APIRoute } from "astro";
import { Resend } from "resend";
import { z } from "zod";
import { RESEND_API_KEY, NOTIFICATION_EMAIL } from "astro:env/server";

export const prerender = false;

// Initialize Resend with API key from environment variables
const getResendInstance = ({ locals }: { locals: any }) => {
  const apiKey =
    locals?.runtime?.env?.RESEND_API_KEY ||
    RESEND_API_KEY ||
    import.meta.env.RESEND_API_KEY ||
    process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
};

// Validation schema for quote form
const quoteSchema = z.object({
  customerName: z.string().min(2, "Please enter your full name"),
  customerPhone: z
    .string()
    .min(7, "Please enter a valid phone number")
    .regex(/^[0-9+()\-\s]+$/, "Only digits and + ( ) - are allowed"),
  customerEmail: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  message: z.string().optional(),

  // Service and location info
  service: z.enum(["towing", "fuel", "lockout", "jumpstart"]),
  fromAddress: z.string().min(5, "Please provide a pickup address"),
  toAddress: z.string().min(5, "Please provide a destination address"),
  miles: z.string().min(1, "Distance calculation is required"),

  // Vehicle info
  vehicleYear: z.string().min(4, "Please provide vehicle year"),
  vehicleMake: z.string().min(1, "Please provide vehicle make"),
  vehicleModel: z.string().min(1, "Please provide vehicle model"),
  vehiclePlate: z.string().min(1, "Please provide license plate"),
  vehicleRegistrationState: z
    .string()
    .min(2, "Please provide registration state"),
  isLargeVehicle: z.boolean(),

  // Discounts
  isVeteran: z.boolean(),
  isStudent: z.boolean(),

  // Calculated cost
  estimatedTotal: z.number().min(0, "Invalid estimated total"),

  // Optional GPS location
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      googleMapsLink: z.string(),
      accuracy: z.string(),
    })
    .optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse the request body
    const body = await request.json();

    // Validate the form data
    const validationResult = quoteSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid form data",
          errors: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const data = validationResult.data;

    // Check if required environment variables are set
    const notificationEmail =
      (locals as any)?.runtime?.env?.NOTIFICATION_EMAIL ||
      NOTIFICATION_EMAIL ||
      import.meta.env.NOTIFICATION_EMAIL ||
      process.env.NOTIFICATION_EMAIL;
    const resendApiKey =
      (locals as any)?.runtime?.env?.RESEND_API_KEY ||
      RESEND_API_KEY ||
      import.meta.env.RESEND_API_KEY ||
      process.env.RESEND_API_KEY;

    if (!notificationEmail || !resendApiKey) {
      console.error(
        "Missing required environment variables: NOTIFICATION_EMAIL or RESEND_API_KEY",
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: "Server configuration error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Get Resend instance
    const resend = getResendInstance({ locals });

    // Format the current date and time
    const now = new Date();
    const formattedDate = now.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });

    // Create service type display
    const serviceTypeDisplay = {
      towing: "🚚 Towing",
      fuel: "⛽ Fuel Delivery",
      lockout: "🔐 Lockout Service",
      jumpstart: "⚡ Jump Start",
    }[data.service];

    // Create discounts display
    const discounts = [];
    if (data.isVeteran) discounts.push("Veteran (10%)");
    if (data.isStudent) discounts.push("Student (8%)");
    const discountText = discounts.length > 0 ? discounts.join(", ") : "None";

    // Create email content for business notification
    const businessEmailSubject = `🚨 New Quote Request - ${data.customerName} - ${serviceTypeDisplay}`;
    const businessEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
            .footer { background: #1f2937; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; }
            .urgent { background: #fee2e2; border: 2px solid #ef4444; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .section { margin-bottom: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #374151; }
            .value { background: white; padding: 10px; border-radius: 4px; border: 1px solid #d1d5db; margin-top: 5px; }
            .highlight { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🚨 New Quote Request</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Collision Towing AZ</p>
            </div>
            
            <div class="content">
              <div class="urgent">
                <strong>⚡ Urgent:</strong> New quote request received. Customer needs ${serviceTypeDisplay} service!
              </div>
              
              <div class="section">
                <h3 style="color: #1e40af; margin-bottom: 15px;">📅 Request Details</h3>
                <div class="field">
                  <div class="label">Received:</div>
                  <div class="value">${formattedDate}</div>
                </div>
                <div class="field">
                  <div class="label">Service Type:</div>
                  <div class="value highlight"><strong>${serviceTypeDisplay}</strong></div>
                </div>
                <div class="field">
                  <div class="label">Estimated Total:</div>
                  <div class="value highlight"><strong>$${data.estimatedTotal.toFixed(2)}</strong></div>
                </div>
              </div>

              <div class="section">
                <h3 style="color: #1e40af; margin-bottom: 15px;">👤 Customer Information</h3>
                <div class="field">
                  <div class="label">Name:</div>
                  <div class="value">${data.customerName}</div>
                </div>
                <div class="field">
                  <div class="label">Phone Number:</div>
                  <div class="value"><a href="tel:${data.customerPhone.replace(/[^\d+]/g, "")}" style="color: #1e40af; text-decoration: none;">${data.customerPhone}</a></div>
                </div>
                ${
                  data.customerEmail
                    ? `
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value"><a href="mailto:${data.customerEmail}" style="color: #1e40af; text-decoration: none;">${data.customerEmail}</a></div>
                </div>
                `
                    : ""
                }
              </div>

              <div class="section">
                <h3 style="color: #1e40af; margin-bottom: 15px;">📍 Location Details</h3>
                <div class="field">
                  <div class="label">From (Pickup):</div>
                  <div class="value">${data.fromAddress}</div>
                </div>
                <div class="field">
                  <div class="label">To (Destination):</div>
                  <div class="value">${data.toAddress}</div>
                </div>
                <div class="field">
                  <div class="label">Distance:</div>
                  <div class="value">${data.miles} miles</div>
                </div>
                ${
                  data.location
                    ? `
                <div class="field">
                  <div class="label">GPS Location Shared:</div>
                  <div class="value">
                    <a href="${data.location.googleMapsLink}" target="_blank" style="color: #1e40af; text-decoration: none;">
                      📍 View exact location on Google Maps
                    </a><br>
                    <small style="color: #6b7280;">Lat: ${data.location.latitude}, Lng: ${data.location.longitude}</small>
                  </div>
                </div>
                `
                    : ""
                }
              </div>

              <div class="section">
                <h3 style="color: #1e40af; margin-bottom: 15px;">🚗 Vehicle Information</h3>
                <div class="grid">
                  <div class="field">
                    <div class="label">Year:</div>
                    <div class="value">${data.vehicleYear}</div>
                  </div>
                  <div class="field">
                    <div class="label">Make:</div>
                    <div class="value">${data.vehicleMake}</div>
                  </div>
                  <div class="field">
                    <div class="label">Model:</div>
                    <div class="value">${data.vehicleModel}</div>
                  </div>
                  <div class="field">
                    <div class="label">License Plate:</div>
                    <div class="value">${data.vehiclePlate}</div>
                  </div>
                  <div class="field">
                    <div class="label">Registration State:</div>
                    <div class="value">${data.vehicleRegistrationState}</div>
                  </div>
                  <div class="field">
                    <div class="label">Large Vehicle:</div>
                    <div class="value">${data.isLargeVehicle ? "Yes" : "No"}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <h3 style="color: #1e40af; margin-bottom: 15px;">💰 Pricing Details</h3>
                <div class="field">
                  <div class="label">Discounts Applied:</div>
                  <div class="value">${discountText}</div>
                </div>
              </div>

              ${
                data.message
                  ? `
              <div class="section">
                <h3 style="color: #1e40af; margin-bottom: 15px;">💬 Customer Message</h3>
                <div class="field">
                  <div class="value">${data.message.replace(/\n/g, "<br>")}</div>
                </div>
              </div>
              `
                  : ""
              }
            </div>
            
            <div class="footer">
              <p style="margin: 0;">⚡ Contact customer immediately to confirm service!</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">Collision Towing AZ - 24/7 Emergency Services</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create customer confirmation email
    const customerEmailSubject = `✅ Quote Request Confirmed - Collision Towing AZ`;
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f0fdfa; padding: 20px; border: 1px solid #6ee7b7; }
            .footer { background: #1f2937; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; }
            .success { background: #d1fae5; border: 2px solid #10b981; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .section { margin-bottom: 20px; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #6b7280; }
            .highlight { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 4px; }
            .contact-info { background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">✅ Quote Request Received</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Collision Towing AZ</p>
            </div>
            
            <div class="content">
              <div class="success">
                <strong>✅ Confirmed:</strong> We've received your quote request for ${serviceTypeDisplay} service!
              </div>
              
              <p>Dear ${data.customerName},</p>
              
              <p>Thank you for choosing Collision Towing AZ! We've received your quote request and will contact you shortly to confirm the details and schedule your service.</p>

              <div class="section">
                <h3 style="color: #059669; margin-bottom: 15px;">📋 Your Quote Summary</h3>
                <div class="field">
                  <span class="label">Service:</span> <span class="value">${serviceTypeDisplay}</span>
                </div>
                <div class="field">
                  <span class="label">From:</span> <span class="value">${data.fromAddress}</span>
                </div>
                <div class="field">
                  <span class="label">To:</span> <span class="value">${data.toAddress}</span>
                </div>
                <div class="field">
                  <span class="label">Distance:</span> <span class="value">${data.miles} miles</span>
                </div>
                <div class="field">
                  <span class="label">Vehicle:</span> <span class="value">${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}</span>
                </div>
                <div class="field">
                  <span class="label">Estimated Total:</span> <span class="value highlight"><strong>$${data.estimatedTotal.toFixed(2)}</strong></span>
                </div>
                ${
                  discounts.length > 0
                    ? `
                <div class="field">
                  <span class="label">Discounts Applied:</span> <span class="value">${discountText}</span>
                </div>
                `
                    : ""
                }
              </div>

              <div class="contact-info">
                <h3 style="color: #1e40af; margin-top: 0;">📞 Need Immediate Service?</h3>
                <p style="margin: 10px 0;">For urgent towing needs, call us directly:</p>
                <p style="margin: 10px 0; font-size: 18px;"><strong>📱 (623) 283-8345</strong></p>
                <p style="margin: 10px 0; font-size: 14px; color: #6b7280;">Available 24/7 for emergency services</p>
              </div>

              <div style="margin: 20px 0; padding: 15px; background: #fef3c7; border-radius: 6px;">
                <p style="margin: 0; font-size: 14px;"><strong>Important Note:</strong> This is an estimate only. Final pricing may vary based on actual conditions, equipment needed, and specific circumstances. We'll confirm the exact price before beginning any work.</p>
              </div>

              <p>We appreciate your business and look forward to serving you!</p>
              
              <p style="margin-bottom: 0;">Best regards,<br>
              <strong>The Collision Towing AZ Team</strong></p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">Collision Towing AZ - Professional Towing Services</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">Licensed • Insured • Available 24/7</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send business notification email
    const businessEmailResponse = await resend.emails.send({
      from: "Collision Towing AZ <info@collisiontowingaz.com>",
      to: [notificationEmail],
      subject: businessEmailSubject,
      html: businessEmailHtml,
      text: `
New Quote Request - ${data.customerName}

Service: ${serviceTypeDisplay}
Estimated Total: $${data.estimatedTotal.toFixed(2)}

Customer: ${data.customerName}
Phone: ${data.customerPhone}
${data.customerEmail ? `Email: ${data.customerEmail}` : ""}

From: ${data.fromAddress}
To: ${data.toAddress}
Distance: ${data.miles} miles

Vehicle: ${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}
License Plate: ${data.vehiclePlate} (${data.vehicleRegistrationState})
Large Vehicle: ${data.isLargeVehicle ? "Yes" : "No"}

Discounts: ${discountText}

${data.location ? `GPS Location: ${data.location.googleMapsLink}` : ""}

${data.message ? `Message: ${data.message}` : ""}

Contact customer immediately to confirm service!
      `.trim(),
    });

    if (businessEmailResponse.error) {
      console.error(
        "Failed to send business notification email:",
        businessEmailResponse.error,
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to send notification email",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Send customer confirmation email (only if email provided)
    let customerEmailResponse = null;
    if (data.customerEmail) {
      customerEmailResponse = await resend.emails.send({
        from: "Collision Towing AZ <info@collisiontowingaz.com>",
        to: [data.customerEmail],
        subject: customerEmailSubject,
        html: customerEmailHtml,
        text: `
Quote Request Confirmed - Collision Towing AZ

Dear ${data.customerName},

Thank you for choosing Collision Towing AZ! We've received your quote request for ${serviceTypeDisplay} service.

Quote Summary:
- Service: ${serviceTypeDisplay}
- From: ${data.fromAddress}
- To: ${data.toAddress}
- Distance: ${data.miles} miles
- Vehicle: ${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}
- Estimated Total: $${data.estimatedTotal.toFixed(2)}
${discounts.length > 0 ? `- Discounts Applied: ${discountText}` : ""}

For immediate service, call us at (623) 283-8345

We'll contact you shortly to confirm details and schedule your service.

Best regards,
The Collision Towing AZ Team
        `.trim(),
      });

      if (customerEmailResponse?.error) {
        console.error(
          "Failed to send customer confirmation email:",
          customerEmailResponse.error,
        );
        // Don't fail the entire request if customer email fails
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Quote request sent successfully",
        businessEmailId: businessEmailResponse.data?.id,
        customerEmailId: customerEmailResponse?.data?.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Quote API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};

// Handle other HTTP methods
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      message: "Quote API endpoint. Use POST to submit quote request.",
    }),
    {
      status: 405,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};
