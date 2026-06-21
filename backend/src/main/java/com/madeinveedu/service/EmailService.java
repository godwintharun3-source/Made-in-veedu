package com.madeinveedu.service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            helper.setFrom("desienterprises1011@gmail.com");

            mailSender.send(message);
            log.info("Successfully sent email to {} with subject: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {} due to: {}. Logging email body:\n{}", to, e.getMessage(), htmlBody);
        }
    }

    public void sendWelcomeEmail(String toEmail, String name) {
        String subject = "Welcome to Made In Veedu!";
        String htmlBody = "<html><body>"
                + "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;'>"
                + "<h2 style='color: #4CAF50; text-align: center;'>Welcome to Made In Veedu</h2>"
                + "<p>Dear " + name + ",</p>"
                + "<p>Thank you for registering with <strong>Made In Veedu</strong>, your destination for organic masalas, health mixes, and traditional snacks.</p>"
                + "<p>We are delighted to have you as part of our family. Explore our range of chemical-free, traditional products and start eating healthy today!</p>"
                + "<div style='text-align: center; margin-top: 30px;'>"
                + "<a href='http://localhost:3000' style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Shop Now</a>"
                + "</div>"
                + "<hr style='margin-top: 30px; border: none; border-top: 1px solid #eaeaea;'/>"
                + "<p style='font-size: 12px; color: #888888; text-align: center;'>Made In Veedu © 2026. All rights reserved.</p>"
                + "</div>"
                + "</body></html>";

        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    public void sendOrderConfirmationEmail(String toEmail, String name, String orderNumber, String totalAmount) {
        String subject = "Order Confirmed - Made In Veedu";
        String htmlBody = "<html><body>"
                + "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;'>"
                + "<h2 style='color: #4CAF50; text-align: center;'>Order Successfully Placed!</h2>"
                + "<p>Dear " + name + ",</p>"
                + "<p>We are excited to let you know that your order has been received and is currently being processed. Here are the details:</p>"
                + "<table style='width: 100%; border-collapse: collapse; margin-top: 20px;'>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Order Number:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>" + orderNumber + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Total Amount:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>₹" + totalAmount + "</td></tr>"
                + "</table>"
                + "<p style='margin-top: 20px;'>We will notify you as soon as your delicious items are shipped!</p>"
                + "<hr style='margin-top: 30px; border: none; border-top: 1px solid #eaeaea;'/>"
                + "<p style='font-size: 12px; color: #888888; text-align: center;'>Made In Veedu © 2026. All rights reserved.</p>"
                + "</div>"
                + "</body></html>";

        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    public void sendOrderToAdminEmail(String orderNumber, String totalAmount, String customerName) {
        String adminEmail = "desienterprises1011@gmail.com";
        String subject = "New Order Placed - " + orderNumber;
        String htmlBody = "<html><body>"
                + "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;'>"
                + "<h2 style='color: #FF5722; text-align: center;'>New Order Received!</h2>"
                + "<p>Hello Admin,</p>"
                + "<p>A new order has been placed by <strong>" + customerName + "</strong>.</p>"
                + "<table style='width: 100%; border-collapse: collapse; margin-top: 20px;'>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Order Number:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>" + orderNumber + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Total Amount:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>₹" + totalAmount + "</td></tr>"
                + "</table>"
                + "<p style='margin-top: 20px;'>Please log in to the admin panel to view full details and process the order.</p>"
                + "<hr style='margin-top: 30px; border: none; border-top: 1px solid #eaeaea;'/>"
                + "<p style='font-size: 12px; color: #888888; text-align: center;'>Made In Veedu System Notification</p>"
                + "</div>"
                + "</body></html>";

        sendHtmlEmail(adminEmail, subject, htmlBody);
    }

    public void sendOrderShippedEmail(String toEmail, String name, String orderNumber) {
        String subject = "Your Order is Shipped - Made In Veedu";
        String htmlBody = "<html><body>"
                + "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;'>"
                + "<h2 style='color: #2196F3; text-align: center;'>Your Package is on the Way!</h2>"
                + "<p>Dear " + name + ",</p>"
                + "<p>Good news! Your order <strong>" + orderNumber + "</strong> has been shipped and is on its way to you.</p>"
                + "<p>You can track its status by logging into your dashboard and navigating to the Order Tracking page.</p>"
                + "<hr style='margin-top: 30px; border: none; border-top: 1px solid #eaeaea;'/>"
                + "<p style='font-size: 12px; color: #888888; text-align: center;'>Made In Veedu © 2026. All rights reserved.</p>"
                + "</div>"
                + "</body></html>";

        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    public void sendOrderDeliveredEmail(String toEmail, String name, String orderNumber) {
        String subject = "Order Delivered Successfully - Made In Veedu";
        String htmlBody = "<html><body>"
                + "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;'>"
                + "<h2 style='color: #4CAF50; text-align: center;'>Order Delivered!</h2>"
                + "<p>Dear " + name + ",</p>"
                + "<p>Your order <strong>" + orderNumber + "</strong> has been successfully delivered. We hope you enjoy our traditional organic products!</p>"
                + "<p>Please take a moment to leave a review and tell us what you think of your items.</p>"
                + "<hr style='margin-top: 30px; border: none; border-top: 1px solid #eaeaea;'/>"
                + "<p style='font-size: 12px; color: #888888; text-align: center;'>Made In Veedu © 2026. All rights reserved.</p>"
                + "</div>"
                + "</body></html>";

        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    public void sendOtpEmail(String toEmail, String otpCode) {
        String subject = "Password Reset OTP - Made In Veedu";
        String htmlBody = "<html><body>"
                + "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;'>"
                + "<h2 style='color: #FF9800; text-align: center;'>Reset Your Password</h2>"
                + "<p>You have requested to reset your password. Use the following 6-digit One-Time Password (OTP) to complete the process:</p>"
                + "<div style='font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 30px 0; color: #333;'>"
                + otpCode
                + "</div>"
                + "<p style='color: #FF0000; font-weight: bold;'>Note: This OTP will expire in 5 minutes.</p>"
                + "<p>If you did not request this, you can safely ignore this email.</p>"
                + "<hr style='margin-top: 30px; border: none; border-top: 1px solid #eaeaea;'/>"
                + "<p style='font-size: 12px; color: #888888; text-align: center;'>Made In Veedu © 2026. All rights reserved.</p>"
                + "</div>"
                + "</body></html>";

        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    public void sendBulkEmail(String toEmail, String subject, String messageContent) {
        String htmlBody = "<html><body>"
                + "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;'>"
                + "<h2 style='color: #4CAF50; text-align: center;'>Made In Veedu Updates</h2>"
                + "<p>" + messageContent + "</p>"
                + "<hr style='margin-top: 30px; border: none; border-top: 1px solid #eaeaea;'/>"
                + "<p style='font-size: 12px; color: #888888; text-align: center;'>Made In Veedu © 2026. All rights reserved.</p>"
                + "</div>"
                + "</body></html>";

        sendHtmlEmail(toEmail, subject, htmlBody);
    }
}
