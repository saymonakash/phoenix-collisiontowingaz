import type { APIRoute } from "astro";
import { Resend } from "resend";
import { z } from "zod";
import { RESEND_API_KEY, NOTIFICATION_EMAIL } from "astro:env/server";

export const prerender = false;

// Initialize Resend with API key from environment variables
const getResendInstance = ({ locals }: { locals: any }) => {
  const apiKey =
    locals?.runtime?.env?.RESEND_API_KEY ||
    import.meta.env.RESEND_API_KEY ||
    process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
};

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  phone: z
    .string()
    .min(7, "Please enter a valid phone number")
    .regex(/^[0-9+()\-\s]+$/, "Only digits and + ( ) - are allowed"),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  message: z.string().min(10, "Please add a few details (10+ chars)"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse the request body
    const body = await request.json();

    // Validate the form data
    const validationResult = contactSchema.safeParse(body);

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

    const { name, phone, email, message } = validationResult.data;

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

    // Create email content
    const emailSubject = `🚨 New Contact Request - ${name}`;
    const emailHtml = `
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
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #374151; }
            .value { background: white; padding: 10px; border-radius: 4px; border: 1px solid #d1d5db; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🚨 New Contact Request</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Collision Towing AZ</p>
            </div>
            
            <div class="content">
              <div class="urgent">
                <strong>⚡ Urgent:</strong> New contact request received. Customer may need immediate assistance!
              </div>
              
              <div class="field">
                <div class="label">📅 Received:</div>
                <div class="value">${formattedDate}</div>
              </div>
              
              <div class="field">
                <div class="label">👤 Customer Name:</div>
                <div class="value">${name}</div>
              </div>
              
              <div class="field">
                <div class="label">📞 Phone Number:</div>
                <div class="value"><a href="tel:${phone.replace(/[^\d+]/g, "")}" style="color: #1e40af; text-decoration: none;">${phone}</a></div>
              </div>
              
              ${
                email
                  ? `
              <div class="field">
                <div class="label">📧 Email:</div>
                <div class="value"><a href="mailto:${email}" style="color: #1e40af; text-decoration: none;">${email}</a></div>
              </div>
              `
                  : ""
              }
              
              <div class="field">
                <div class="label">💬 Message:</div>
                <div class="value">${message.replace(/\n/g, "<br>")}</div>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">⚡ Respond quickly to provide excellent customer service!</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">Collision Towing AZ - 24/7 Emergency Services</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email notification using Resend
    const emailResponse = await resend.emails.send({
      from: "Collision Towing AZ <info@collisiontowingaz.com>",
      to: [notificationEmail],
      subject: emailSubject,
      html: emailHtml,
      text: `
New Contact Request - ${name}

Received: ${formattedDate}
Customer Name: ${name}
Phone: ${phone}
${email ? `Email: ${email}` : ""}

Message:
${message}

Please respond quickly to provide excellent customer service!
      `.trim(),
    });

    if (emailResponse.error) {
      console.error("Failed to send email:", emailResponse.error);
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

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Contact request sent successfully",
        emailId: emailResponse.data?.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Contact API error:", error);
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
      message: "Contact API endpoint. Use POST to submit contact form.",
    }),
    {
      status: 405,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};
