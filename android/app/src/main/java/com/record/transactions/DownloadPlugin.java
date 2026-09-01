package com.record.transactions.download;

import android.app.DownloadManager;
import android.content.Context;
import android.net.Uri;
import android.os.Environment;

import androidx.core.content.FileProvider;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.FileOutputStream;
import java.io.File;

@CapacitorPlugin(name = "DownloadPlugin")
public class DownloadPlugin extends Plugin {

    @PluginMethod
    public void saveFile(PluginCall call) {
        String base64 = call.getString("base64");
        String filename = call.getString("filename");

        try {
            byte[] bytes = android.util.Base64.decode(base64, android.util.Base64.DEFAULT);

            // 1. Guardar en almacenamiento interno de la app
            File internalFile = new File(getContext().getFilesDir(), filename);
            FileOutputStream fos = new FileOutputStream(internalFile);
            fos.write(bytes);
            fos.close();

            // 2. Exponerlo con FileProvider
            Uri fileUri = FileProvider.getUriForFile(
                    getContext(),
                    getContext().getPackageName() + ".provider",
                    internalFile
            );

            // 3. Copiarlo a Descargas usando DownloadManager
            DownloadManager.Request request = new DownloadManager.Request(fileUri);
            request.setTitle(filename);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename);
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.addRequestHeader("Content-Type", "application/json");

            DownloadManager dm = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
            dm.enqueue(request);

            call.resolve();
        } catch (Exception e) {
            call.reject("Error: " + e.getMessage());
        }
    }
}
