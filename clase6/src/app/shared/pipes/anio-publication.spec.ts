import { DATE_PIPE_DEFAULT_OPTIONS } from "@angular/common";
import { AnioPublicacionPipe } from "./anio-publicacion.pipe";

describe('AnioPublication Pipe', ()=>{
    let pipe : AnioPublicacionPipe

    beforeEach(()=>{
        pipe = new AnioPublicacionPipe();
    });

    it('Deberia que crear una instancia una isntancia del pipe', ()=>{
        expect(pipe).toBeTruthy();
    })
    it('Debe retornar "Este año (AÑO) cuando el año es el actual', ()=>{
        const anioActual = new Date().getFullYear();
        const resultado = pipe.transform(anioActual);
        expect(resultado).toBe(`Este año (${anioActual})`)
    })
    it('debe retornar "este año" cuando el año es futuro', ()=>{
        const anioFuturo = new Date().getFullYear()+5;
        const resultado = pipe.transform(anioFuturo);
       expect(resultado).toBe(`Este año (${anioFuturo})`)
    })
    it('Debe retornar "Hace un año" cunado la diferencia es 1' , ()=>{
        const anioAnterior = new Date().getFullYear()-1;
        const resultado = pipe.transform(anioAnterior);
        expect(resultado).toBe(`Hace 1 año (${anioAnterior})`)
    })

    it("Debe manejar años antiguos correctamente", ()=>{
        const anioActual = new Date().getFullYear();
        const diferencia = anioActual - 100;
        const resultado = pipe.transform(100);
        expect(resultado).toBe(`Hace ${diferencia} años (100)`)
    })

})