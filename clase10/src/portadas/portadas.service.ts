import { BadGatewayException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { rejects } from 'assert';
import { v2 as cloudinary} from 'cloudinary';
import { error } from 'console';
import { randomUUID } from 'crypto';

export const MAX_PORTADA_BYTES = 5 * 1024 * 1024

@Injectable()
export class PortadasService {
    private readonly logger = new Logger(PortadasService.name);

    private opciones(){
        const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

        if(!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET){
            throw new ServiceUnavailableException('Falta configurar cloudinary en el servidor (.env)')
        }
        return {
            cloud_name : CLOUDINARY_CLOUD_NAME,
            api_key : CLOUDINARY_API_KEY,
            api_secret : CLOUDINARY_API_SECRET,
            secure : true
        }
    }

    async subir(buffer: Buffer): Promise<{url: string; publicId: string}>{
        const opciones = this.opciones();

        return new Promise((resolve, reject)=>{
            const stream = cloudinary.uploader.upload_stream({
                ...opciones,
                folder: '/libros',
                resource_type: 'image',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                public_id : `libros/portadas/${randomUUID()}`,
                overwrite : false,
            },
        (error,resultado)=>{
            if(error || !resultado){
                return reject( new BadGatewayException("No se pudo abrir la portada"))
            }
            resolve({url: resultado.secure_url, publicId: resultado.public_id})
        })
        stream.end(buffer);
        })
    }

    async eliminar(public_id?: string): Promise<void>{
        if(!public_id) return;
        try{
            const resultado = (await cloudinary.uploader.destroy(public_id, {
                ...this.opciones(),
                resource_type: 'image',
                invalidate: true,
            })) 
        }catch{
            this.logger.warn(`Pendiente de limpieza en Cloudinary ${public_id}`)
        }
    }
}
